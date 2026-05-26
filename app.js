const STORAGE_KEY = "vidhire-demo-state";
const USER_KEY = "vidhire-current-user";
const API_BASE = "";

const seedState = {
  users: [
    {
      id: "user-1",
      email: "candidate@demo.com",
      password: "demo123",
      name: "Aarav Mehta",
      role: "candidate"
    },
    {
      id: "user-2",
      email: "recruiter@demo.com",
      password: "demo123",
      name: "Priya Sharma",
      role: "recruiter"
    }
  ],
  candidates: [
    {
      id: "cand-aarav",
      name: "Aarav Mehta",
      role: "Frontend Developer",
      experience: "1-2 years",
      location: "Bengaluru, India",
      skills: ["React", "TypeScript", "Tailwind", "APIs", "UI Design"],
      portfolio: "github.com/aarav, aarav.dev",
      summary:
        "Frontend candidate with dashboard, API, and UI delivery experience. Strong fit for product teams that need polished interfaces and clear communication.",
      stage: "Shortlisted",
      videoUrl: "",
      resumeFile: "aarav-resume.pdf"
    },
    {
      id: "cand-maya",
      name: "Maya Nair",
      role: "Full Stack Developer",
      experience: "3-5 years",
      location: "Hyderabad, India",
      skills: ["Node.js", "React", "PostgreSQL", "Prisma", "APIs"],
      portfolio: "github.com/mayanair",
      summary:
        "Full stack builder with strong API, database, and frontend delivery skills. Good for teams needing end-to-end ownership.",
      stage: "Applied",
      videoUrl: "",
      resumeFile: "maya-resume.pdf"
    },
    {
      id: "cand-rhea",
      name: "Rhea Kapoor",
      role: "Product Designer",
      experience: "1-2 years",
      location: "Pune, India",
      skills: ["Figma", "UX Research", "Design Systems", "Prototyping"],
      portfolio: "rhea.design",
      summary:
        "Designer with research, prototyping, and system thinking experience. Best suited for UX-heavy roles.",
      stage: "Interview",
      videoUrl: "",
      resumeFile: "rhea-resume.pdf"
    }
  ],
  interviews: [],
  applications: [],
  messages: [],
  jobs: [
    {
      id: "job-frontend",
      title: "Frontend Developer Intern",
      company: "NovaHire Labs",
      companyAbout: "NovaHire Labs builds AI hiring tools for fast-growing startups. Series A, 30+ engineers, fully remote.",
      verified: true,
      skills: ["React", "TypeScript", "APIs", "Tailwind"],
      description:
        "Looking for a frontend developer who can build polished interfaces, consume APIs, collaborate with design, and communicate clearly."
    },
    {
      id: "job-fullstack",
      title: "Full Stack Developer",
      company: "TechVentures Inc",
      companyAbout: "TechVentures Inc is a B2B SaaS company helping enterprises modernize legacy systems. 80+ employees, hybrid in Bengaluru.",
      verified: true,
      skills: ["Node.js", "React", "PostgreSQL", "APIs"],
      description:
        "Seeking a full stack developer to build scalable web applications with modern tech stack."
    },
    {
      id: "job-designer",
      title: "UI/UX Designer",
      company: "DesignHub",
      companyAbout: "DesignHub is a product design studio creating beautiful experiences for fintech and healthtech startups.",
      verified: true,
      skills: ["Figma", "UX Research", "Design Systems"],
      description:
        "Looking for a creative designer to craft beautiful and intuitive user experiences."
    }
  ]
};

let state = structuredClone(seedState);
let currentUser = null;
let currentView = "dashboard";
let activeDialogCandidateId = "";
let activeChatId = "";
let mediaRecorder = null;
let recordedChunks = [];
let recordedVideoUrl = "";
let cameraStream = null;

const viewTitles = {
  dashboard: "Hiring Control Room",
  candidate: "My Profile",
  jobs: "Browse Jobs",
  applications: "My Applications",
  messages: "Messages",
  recruiter: "Recruiter Workspace",
  pipeline: "Hiring Pipeline",
  graph: "Project Graph"
};

const pipelineStages = ["Applied", "Shortlisted", "Interview", "Offer"];

document.addEventListener("DOMContentLoaded", async () => {
  await hydrateState();
  checkAuth();
  bindAuth();
  bindNavigation();
  bindForms();
  bindUploads();
});

async function hydrateState() {
  try {
    const response = await fetch(`${API_BASE}/api/state`);
    if (!response.ok) throw new Error("Backend unavailable");
    state = normalizeState(await response.json());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    state = loadLocalState();
  }
}

function loadLocalState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return structuredClone(seedState);

  try {
    return normalizeState(JSON.parse(stored));
  } catch {
    return structuredClone(seedState);
  }
}

function normalizeState(nextState) {
  return {
    users: nextState.users || structuredClone(seedState.users),
    candidates: nextState.candidates || structuredClone(seedState.candidates),
    interviews: nextState.interviews || [],
    applications: nextState.applications || [],
    messages: nextState.messages || [],
    jobs: nextState.jobs || structuredClone(seedState.jobs)
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncStateToBackend();
}

async function syncStateToBackend() {
  try {
    await fetch(`${API_BASE}/api/state`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
  } catch {
    // Direct file usage keeps working through localStorage.
  }
}

// Authentication Functions
function checkAuth() {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      showApp();
      updateNavForRole();
      renderAll();
    } catch {
      showLogin();
    }
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("app-shell").style.display = "none";
}

function showApp() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("app-shell").style.display = "flex";
  document.getElementById("user-name-display").textContent = currentUser.name;
  document.getElementById("user-role-display").textContent = currentUser.role === "candidate" ? "Job Seeker" : "Recruiter";
  // Pre-fill candidate form with the logged-in user's name
  prefillCandidateForm();
}

function prefillCandidateForm() {
  if (!currentUser) return;
  const form = document.getElementById("candidate-form");
  if (!form) return;

  // If a profile exists for this user, load it; otherwise just set the name
  const existing = state.candidates.find(c => c.name === currentUser.name);
  if (existing) {
    form.elements.name.value = existing.name;
    form.elements.role.value = existing.role || "";
    form.elements.experience.value = existing.experience || "Fresher";
    form.elements.location.value = existing.location || "";
    form.elements.skills.value = (existing.skills || []).join(", ");
    form.elements.portfolio.value = existing.portfolio || "";
    if (form.elements.education) form.elements.education.value = existing.education || "";
    if (form.elements.yearsExp) form.elements.yearsExp.value = existing.yearsExp || "";
    if (form.elements.workExperience) form.elements.workExperience.value = existing.workExperience || "";
    form.elements.resumeText.value = existing.summary || "";
    if (existing.videoUrl) renderVideoPreview(existing.videoUrl);
    document.getElementById("preview-name").textContent = existing.name;
    if (existing.kycVerified) {
      document.getElementById("preview-kyc-badge").style.display = "inline-flex";
    }
  } else if (currentUser.role === "candidate") {
    // New candidate - just set their name, clear other defaults
    form.elements.name.value = currentUser.name;
    document.getElementById("preview-name").textContent = currentUser.name;
  }
}

function updateNavForRole() {
  const nav = document.getElementById("main-nav");
  const candidateOnly = ["jobs", "applications"];
  const recruiterOnly = ["recruiter", "pipeline"];

  nav.querySelectorAll(".nav-item").forEach(btn => {
    const view = btn.dataset.view;
    if (currentUser.role === "candidate") {
      btn.style.display = recruiterOnly.includes(view) ? "none" : "flex";
    } else {
      btn.style.display = candidateOnly.includes(view) ? "none" : "flex";
    }
  });

  // Hide "Add Candidate" button on dashboard — it's a recruiter action
  const addBtn = document.getElementById("add-candidate-btn");
  if (addBtn) {
    if (currentUser.role === "candidate") {
      addBtn.textContent = "Edit My Profile";
      addBtn.dataset.viewJump = "candidate";
    } else {
      addBtn.textContent = "Find Candidate";
      addBtn.dataset.viewJump = "recruiter";
    }
  }
}

function bindAuth() {
  // Tab switching
  document.querySelectorAll(".login-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".login-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".login-form").forEach(f => f.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`${tab.dataset.tab}-form`).classList.add("active");
    });
  });

  // Login
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");
    const role = form.get("role");

    // Demo: Accept any credentials
    const user = state.users.find(u => u.email === email) || {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role
    };

    currentUser = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    showApp();
    updateNavForRole();
    renderAll();
    // Land each role on the most useful starting view
    switchView(currentUser.role === "candidate" ? "jobs" : "dashboard");
  });

  // Signup
  document.getElementById("signup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const user = {
      id: crypto.randomUUID(),
      email: form.get("email"),
      password: form.get("password"),
      name: form.get("name"),
      role: form.get("role")
    };

    state.users.push(user);
    saveState();
    currentUser = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    showApp();
    updateNavForRole();
    renderAll();
    // Candidates start at profile builder, recruiters at recruiter workspace
    switchView(currentUser.role === "candidate" ? "candidate" : "recruiter");
    showToast(`Welcome to VidHire, ${user.name}!`);
  });

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem(USER_KEY);
    showLogin();
  });
}

function bindNavigation() {
  document.querySelectorAll("[data-view], [data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.view || button.dataset.viewJump;
      switchView(next);
    });
  });

  document.getElementById("reset-demo").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(seedState);
    activeDialogCandidateId = "";
    activeChatId = "";
    kycState = { step: 0, idUploaded: false, selfieDone: false, verified: false };
    // Reset KYC UI
    ["kyc-step-1","kyc-step-2","kyc-step-3"].forEach((id,i) => {
      const el = document.getElementById(id);
      el.classList.remove("done","active");
      if (i === 0) el.classList.add("active");
    });
    const kycLabel = document.getElementById("kyc-status-label");
    if (kycLabel) kycLabel.textContent = "Not Verified";
    const kycMsg = document.getElementById("kyc-verified-msg");
    if (kycMsg) kycMsg.style.display = "none";
    const kycBadge = document.getElementById("preview-kyc-badge");
    if (kycBadge) kycBadge.style.display = "none";
    const selfieBtn = document.getElementById("kyc-selfie-btn");
    if (selfieBtn) selfieBtn.disabled = true;
    const verifyStatus = document.getElementById("kyc-verify-status");
    if (verifyStatus) { verifyStatus.textContent = "Pending"; verifyStatus.style.color = ""; }
    resetBackendState();
    renderAll();
    showToast("Demo data reset");
  });

  document.getElementById("close-dialog").addEventListener("click", () => {
    document.getElementById("profile-dialog").close();
  });

  document.getElementById("schedule-dialog").addEventListener("click", () => {
    if (!activeDialogCandidateId) return;
    scheduleInterview(activeDialogCandidateId);
    document.getElementById("profile-dialog").close();
    switchView("pipeline");
  });

  document.getElementById("message-dialog").addEventListener("click", () => {
    if (!activeDialogCandidateId) return;
    const candidate = state.candidates.find(c => c.id === activeDialogCandidateId);
    const job = activeJob();
    if (!candidate || !job) return;
    // Ensure conversation exists
    createConversation(candidate.id, job);
    document.getElementById("profile-dialog").close();
    switchView("messages");
    openChat(makeConvId(candidate.id, job.id));
  });

  // Job details dialog
  document.getElementById("job-detail-close").addEventListener("click", () => {
    document.getElementById("job-details-dialog").close();
  });

  // Org profile dialog
  document.getElementById("org-close").addEventListener("click", () => {
    document.getElementById("org-profile-dialog").close();
  });

  // Virtual interview room
  document.getElementById("end-call").addEventListener("click", endVirtualInterview);
  document.getElementById("toggle-mic").addEventListener("click", toggleMic);
  document.getElementById("toggle-cam").addEventListener("click", toggleCam);
}

function bindForms() {
  document.getElementById("candidate-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (mediaRecorder?.state === "recording") {
      setRecordingStatus("Stop the recording before generating the candidate profile.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const skills = parseSkills(form.get("skills"));
    const videoInput = event.currentTarget.elements.videoFile;
    const resumeInput = event.currentTarget.elements.resumeFile;
    const uploadedVideoUrl = videoInput.files[0] ? URL.createObjectURL(videoInput.files[0]) : "";
    const candidate = {
      id: crypto.randomUUID(),
      name: String(form.get("name")).trim(),
      role: String(form.get("role")).trim(),
      experience: String(form.get("experience")).trim(),
      location: String(form.get("location")).trim(),
      education: String(form.get("education") || "").trim(),
      yearsExp: String(form.get("yearsExp") || "").trim(),
      workExperience: String(form.get("workExperience") || "").trim(),
      skills,
      portfolio: String(form.get("portfolio")).trim(),
      summary: generateSummary(form.get("role"), skills, form.get("resumeText")),
      stage: "Applied",
      videoUrl: recordedVideoUrl || uploadedVideoUrl,
      resumeFile: resumeInput.files[0]?.name || "Uploaded resume"
    };

    state.candidates = [candidate, ...state.candidates.filter((item) => item.name !== candidate.name)];
    saveState();
    renderAll();
    showToast("Profile saved ✓");
    switchView(currentUser?.role === "recruiter" ? "recruiter" : "jobs");
  });

  document.getElementById("job-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const job = {
      id: crypto.randomUUID(),
      title: String(form.get("title")).trim(),
      company: String(form.get("company")).trim(),
      skills: parseSkills(form.get("skills")),
      description: String(form.get("description")).trim()
    };

    state.jobs = [job, ...state.jobs];
    saveState();
    renderAll();
  });

  document.getElementById("candidate-search").addEventListener("input", renderCandidateResults);
  document.getElementById("parse-resume").addEventListener("click", parseResumeIntoSkills);
  
  // Job search
  document.getElementById("job-search").addEventListener("input", renderJobs);
  
  // Chat form
  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const message = form.get("message");
    if (!message.trim() || !activeChatId) return;
    
    sendMessage(activeChatId, message);
    e.target.reset();
  });
}

function bindUploads() {
  const form = document.getElementById("candidate-form");
  const resumeInput = form.elements.resumeFile;
  const videoInput = form.elements.videoFile;

  resumeInput.addEventListener("change", () => {
    document.getElementById("resume-file-name").textContent = resumeInput.files[0]?.name || "No file selected";
  });

  videoInput.addEventListener("change", () => {
    const file = videoInput.files[0];
    document.getElementById("video-file-name").textContent = file?.name || "No file selected";
    if (!file) return;
    clearRecordedVideo();
    renderVideoPreview(URL.createObjectURL(file));
  });

  form.addEventListener("input", () => {
    const formData = new FormData(form);
    const skills = parseSkills(formData.get("skills"));
    document.getElementById("preview-name").textContent = formData.get("name") || "Candidate";
    document.getElementById("preview-summary").textContent = generateSummary(
      formData.get("role"),
      skills,
      formData.get("resumeText")
    );
    renderTags(document.getElementById("preview-tags"), skills);
  });

  bindRecorder();
  bindKyc();
}

function bindRecorder() {
  document.getElementById("start-recording").addEventListener("click", startRecording);
  document.getElementById("stop-recording").addEventListener("click", stopRecording);
  document.getElementById("discard-recording").addEventListener("click", () => {
    clearRecordedVideo();
    renderEmptyVideoPreview();
    setRecordingStatus("Recording discarded. Upload a video or record again.");
  });
}

/* ── KYC Verification Flow ── */
let kycState = { step: 0, idUploaded: false, selfieDone: false, verified: false };

function bindKyc() {
  const idUpload = document.getElementById("kyc-id-upload");
  const selfieBtn = document.getElementById("kyc-selfie-btn");

  idUpload.addEventListener("change", () => {
    if (!idUpload.files[0]) return;
    kycState.idUploaded = true;
    advanceKycStep(1);
    selfieBtn.disabled = false;
  });

  selfieBtn.addEventListener("click", async () => {
    selfieBtn.textContent = "Capturing…";
    selfieBtn.disabled = true;
    // Simulate selfie capture with camera flash effect
    await captureSelfie();
    kycState.selfieDone = true;
    advanceKycStep(2);
    runAiVerification();
  });
}

function advanceKycStep(stepIndex) {
  // mark previous steps done, current step active
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`kyc-step-${i}`);
    el.classList.remove("done", "active");
    if (i < stepIndex + 1) el.classList.add("done");
    else if (i === stepIndex + 1) el.classList.add("active");
  }
}

async function captureSelfie() {
  return new Promise(resolve => {
    // Visual flash to imply selfie capture
    document.body.style.transition = "filter 0.1s";
    document.body.style.filter = "brightness(2)";
    setTimeout(() => {
      document.body.style.filter = "";
      resolve();
    }, 200);
  });
}

async function runAiVerification() {
  const statusEl = document.getElementById("kyc-verify-status");
  const labelEl = document.getElementById("kyc-status-label");
  statusEl.textContent = "Verifying…";

  // Simulate AI verification delay (1.8s)
  await new Promise(r => setTimeout(r, 1800));

  kycState.verified = true;
  advanceKycStep(3);
  statusEl.textContent = "✓ Passed";
  statusEl.style.color = "var(--green)";
  labelEl.innerHTML = '<span class="kyc-verified-badge">✓ Identity Verified</span>';

  document.getElementById("kyc-verified-msg").style.display = "block";
  document.getElementById("preview-kyc-badge").style.display = "inline-flex";

  // Mark current logged-in user's candidate profile as verified
  if (currentUser) {
    const candidate = state.candidates.find(c => c.name === currentUser.name);
    if (candidate) {
      candidate.kycVerified = true;
      saveState();
    }
  }
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    setRecordingStatus("This browser does not support in-page video recording. Use video upload instead.");
    return;
  }

  try {
    clearRecordedVideo();
    recordedChunks = [];
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    mediaRecorder = new MediaRecorder(cameraStream);
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    });
    mediaRecorder.addEventListener("stop", saveRecording);
    mediaRecorder.start();
    renderLivePreview(cameraStream);
    setRecorderButtons(true);
    document.getElementById("recording-live-indicator").style.display = "block";
    setRecordingStatus("Recording in progress. Stop when the candidate pitch is complete.");
  } catch {
    setRecordingStatus("Camera permission was blocked or unavailable. Use video upload instead.");
  }
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;
  mediaRecorder.stop();
  stopCameraStream();
  setRecorderButtons(false);
  document.getElementById("recording-live-indicator").style.display = "none";
}

function saveRecording() {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  recordedVideoUrl = URL.createObjectURL(blob);
  renderVideoPreview(recordedVideoUrl);
  document.getElementById("video-file-name").textContent = "Recorded in browser";
  document.getElementById("discard-recording").disabled = false;
  setRecordingStatus("Recording saved locally for this demo profile.");
}

function stopCameraStream() {
  if (!cameraStream) return;
  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

function clearRecordedVideo() {
  if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
  recordedVideoUrl = "";
  recordedChunks = [];
  document.getElementById("discard-recording").disabled = true;
}

function setRecorderButtons(isRecording) {
  document.getElementById("start-recording").disabled = isRecording;
  document.getElementById("stop-recording").disabled = !isRecording;
  document.getElementById("discard-recording").disabled = isRecording || !recordedVideoUrl;
}

function setRecordingStatus(message) {
  document.getElementById("recording-status").textContent = message;
}

async function resetBackendState() {
  try {
    const response = await fetch(`${API_BASE}/api/reset`, { method: "POST" });
    if (response.ok) state = normalizeState(await response.json());
  } catch {
    // local reset already happened
  }
}

async function parseResumeIntoSkills() {
  const form = document.getElementById("candidate-form");
  const resumeText = form.elements.resumeText.value;
  const existing = parseSkills(form.elements.skills.value);
  const extracted = await parseSkillsWithBackend(resumeText);
  const merged = [...new Set([...existing, ...extracted])];
  form.elements.skills.value = merged.join(", ");
  renderTags(document.getElementById("preview-tags"), merged);
  document.getElementById("preview-summary").textContent = generateSummary(form.elements.role.value, merged, resumeText);
}

async function parseSkillsWithBackend(resumeText) {
  try {
    const response = await fetch(`${API_BASE}/api/parse-skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText })
    });
    if (!response.ok) throw new Error("Skill parser unavailable");
    const payload = await response.json();
    return payload.skills || [];
  } catch {
    return extractSkillsFromText(resumeText);
  }
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
  document.getElementById(`${view}-view`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  document.getElementById("view-title").textContent = viewTitles[view];
}

// Jobs Functions
function renderJobs() {
  const target = document.getElementById("jobs-list");
  const query = document.getElementById("job-search")?.value?.toLowerCase() || "";
  target.innerHTML = "";

  const filteredJobs = state.jobs.filter(job => {
    const haystack = [job.title, job.company, ...job.skills].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  if (!filteredJobs.length) {
    target.innerHTML = '<p style="padding: 40px; text-align: center; color: #64748b;">No jobs found</p>';
    return;
  }

  filteredJobs.forEach(job => {
    const card = createJobCard(job);
    target.appendChild(card);
  });
}

function createJobCard(job) {
  const template = document.getElementById("job-card-template");
  const node = template.content.firstElementChild.cloneNode(true);
  
  const userCandidate = currentUser?.role === "candidate" ? 
    state.candidates.find(c => c.name === currentUser.name) : null;
  const hasApplied = userCandidate ? 
    state.applications.some(app => app.candidateId === userCandidate.id && app.jobId === job.id) : false;

  node.querySelector("h4").textContent = job.title;
  node.querySelector(".company-name").textContent = job.company;
  node.querySelector(".job-description").textContent = job.description;
  node.querySelector(".status-pill").textContent = hasApplied ? "Applied" : "Open";
  node.querySelector(".status-pill").style.background = hasApplied ? "#10b981" : "#667eea";
  renderTags(node.querySelector(".tag-row"), job.skills);

  const applyBtn = node.querySelector("[data-action='apply']");
  if (hasApplied) {
    applyBtn.textContent = "Applied";
    applyBtn.disabled = true;
    applyBtn.style.opacity = "0.5";
  } else {
    applyBtn.addEventListener("click", () => applyToJob(job.id));
  }

  // View Details button
  node.querySelector("[data-action='view']").addEventListener("click", () => openJobDetails(job));

  // Click company name to view org profile
  node.querySelector(".company-name").style.cursor = "pointer";
  node.querySelector(".company-name").addEventListener("click", (e) => {
    e.stopPropagation();
    openOrgProfile(job.company);
  });

  return node;
}

// ─── Job Details Dialog ───
function openJobDetails(job) {
  document.getElementById("job-detail-title").textContent = job.title;
  document.getElementById("job-detail-company").textContent = `${job.company}${job.verified ? " · ✓ Verified" : ""}`;
  document.getElementById("job-detail-description").textContent = job.description;
  renderTags(document.getElementById("job-detail-skills"), job.skills);

  // Calculate match for the logged-in candidate
  const candidate = currentUser?.role === "candidate"
    ? state.candidates.find(c => c.name === currentUser.name)
    : null;
  const matchCard = document.getElementById("job-detail-match-card");

  if (candidate) {
    const score = scoreCandidate(candidate, job);
    document.getElementById("job-detail-score").textContent = `${score}%`;
    document.getElementById("job-detail-score-fill").style.width = `${score}%`;
    document.getElementById("job-detail-match-reason").textContent = matchReason(candidate, job, score);
    matchCard.style.display = "";
  } else {
    matchCard.style.display = "none";
  }

  // Wire apply button
  const applyBtn = document.getElementById("job-detail-apply");
  const hasApplied = candidate
    ? state.applications.some(a => a.candidateId === candidate.id && a.jobId === job.id)
    : false;

  if (currentUser?.role !== "candidate") {
    applyBtn.style.display = "none";
  } else if (hasApplied) {
    applyBtn.style.display = "";
    applyBtn.textContent = "✓ Already Applied";
    applyBtn.disabled = true;
  } else {
    applyBtn.style.display = "";
    applyBtn.textContent = "Apply Now";
    applyBtn.disabled = false;
    applyBtn.onclick = () => {
      applyToJob(job.id);
      document.getElementById("job-details-dialog").close();
    };
  }

  document.getElementById("job-details-dialog").showModal();
}

// ─── Organization Profile Dialog ───
function openOrgProfile(companyName) {
  const jobsForOrg = state.jobs.filter(j => j.company === companyName);
  const orgInfo = jobsForOrg[0];
  if (!orgInfo) return;

  document.getElementById("org-name").textContent = companyName;
  document.getElementById("org-logo").textContent = companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  document.getElementById("org-about").textContent = orgInfo.companyAbout || `${companyName} is hiring on VidHire.`;

  const jobsList = document.getElementById("org-jobs-list");
  jobsList.innerHTML = "";
  jobsForOrg.forEach(j => {
    const row = document.createElement("div");
    row.className = "org-job-row";
    row.innerHTML = `
      <div>
        <strong>${j.title}</strong>
        <span>${j.skills.slice(0, 4).join(" · ")}</span>
      </div>
      <button class="ghost-button small" type="button">View</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
      document.getElementById("org-profile-dialog").close();
      openJobDetails(j);
    });
    jobsList.appendChild(row);
  });

  document.getElementById("org-profile-dialog").showModal();
}

function applyToJob(jobId) {
  if (!currentUser || currentUser.role !== "candidate") return;

  let candidate = state.candidates.find(c => c.name === currentUser.name);
  const job = state.jobs.find(j => j.id === jobId);
  if (!job) return;

  // If candidate has no profile yet, prompt them to fill one out first.
  // Auto-creating a blank profile gives them a 0% match which looks bad in the demo.
  if (!candidate) {
    showToast("Please complete your profile first", "error");
    switchView("candidate");
    return;
  }

  // Don't double-apply
  if (state.applications.some(a => a.candidateId === candidate.id && a.jobId === jobId)) return;

  const application = {
    id: crypto.randomUUID(),
    candidateId: candidate.id,
    jobId,
    appliedAt: new Date().toISOString(),
    status: "Applied"
  };

  state.applications.push(application);
  candidate.stage = "Applied";

  saveState();
  renderJobs();
  renderApplications();
  renderPipeline();
  renderNavBadges();
  showToast(`Applied to ${job.title} ✓`);

  createConversation(candidate.id, job);
}

function makeConvId(candidateId, jobId) {
  return `conv|${candidateId}|${jobId}`;
}

function parseConvId(convId) {
  const parts = convId.split("|");
  return { candidateId: parts[1], jobId: parts[2] };
}

function createConversation(candidateId, job) {
  const conversationId = makeConvId(candidateId, job.id);

  if (state.messages.some(m => m.conversationId === conversationId)) return;

  const welcomeMessage = {
    id: crypto.randomUUID(),
    conversationId,
    senderId: "system",
    senderName: job.company,
    text: `Thank you for applying to ${job.title}! We have received your application and will review it shortly.`,
    timestamp: new Date().toISOString()
  };

  state.messages.push(welcomeMessage);
  saveState();
}

// Applications Functions
function renderApplications() {
  const target = document.getElementById("applications-list");
  target.innerHTML = "";

  if (!currentUser || currentUser.role !== "candidate") {
    target.innerHTML = '<p style="padding: 40px; text-align: center; color: #64748b;">Recruiter view</p>';
    return;
  }

  const candidate = state.candidates.find(c => c.name === currentUser.name);
  if (!candidate) {
    target.innerHTML = '<p style="padding: 40px; text-align: center; color: #64748b;">Complete your profile to apply for jobs</p>';
    return;
  }

  const userApplications = state.applications.filter(app => app.candidateId === candidate.id);

  if (!userApplications.length) {
    target.innerHTML = '<p style="padding: 40px; text-align: center; color: #64748b;">No applications yet. Browse jobs to apply!</p>';
    return;
  }

  userApplications.forEach(app => {
    const job = state.jobs.find(j => j.id === app.jobId);
    if (!job) return;

    const stageLabel = candidate.stage || app.status;
    const stageColor = { Applied: "#667eea", Shortlisted: "#f59e0b", Interview: "#3b82f6", Offer: "#10b981" }[stageLabel] || "#667eea";

    const card = document.createElement("article");
    card.className = "application-card";
    card.innerHTML = `
      <div class="application-info">
        <h4>${job.title}</h4>
        <p>${job.company}</p>
        <p style="font-size:12px;color:#94a3b8;">Applied: ${formatInterviewTime(app.appliedAt)}</p>
      </div>
      <div class="application-status">
        <span class="status-pill" style="background:${stageColor}">${stageLabel}</span>
        <button class="ghost-button small" style="margin-top: 8px; display:block;">View Chat</button>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => {
      switchView("messages");
      openChat(makeConvId(candidate.id, job.id));
    });

    target.appendChild(card);
  });
}

// Messages Functions
function renderConversations() {
  const target = document.getElementById("conversations-list");
  target.innerHTML = "";

  if (!currentUser) return;

  const conversations = getConversationsForUser();

  if (!conversations.length) {
    target.innerHTML = '<p style="padding: 20px; text-align: center; color: #64748b; font-size: 13px;">No conversations yet</p>';
    return;
  }

  conversations.forEach(conv => {
    const item = document.createElement("div");
    item.className = "conversation-item";
    if (activeChatId === conv.id) item.classList.add("active");
    
    item.innerHTML = `
      <h4>${conv.name}</h4>
      <p>${conv.lastMessage}</p>
    `;
    
    item.addEventListener("click", () => openChat(conv.id));
    target.appendChild(item);
  });
}

function getConversationsForUser() {
  const conversations = [];
  const grouped = {};

  state.messages.forEach(msg => {
    if (!grouped[msg.conversationId]) {
      grouped[msg.conversationId] = [];
    }
    grouped[msg.conversationId].push(msg);
  });

  Object.keys(grouped).forEach(convId => {
    const messages = grouped[convId];
    const lastMsg = messages[messages.length - 1];

    // Use safe "|" separator to avoid UUID hyphen collision
    const { candidateId, jobId } = parseConvId(convId);

    const candidate = state.candidates.find(c => c.id === candidateId);
    const job = state.jobs.find(j => j.id === jobId);

    if (!candidate || !job) return;

    let name = "";
    if (currentUser.role === "candidate" && candidate.name === currentUser.name) {
      name = `${job.company} - ${job.title}`;
    } else if (currentUser.role === "recruiter") {
      name = `${candidate.name} - ${job.title}`;
    } else {
      return;
    }

    conversations.push({
      id: convId,
      name,
      lastMessage: lastMsg.text.substring(0, 50) + "...",
      timestamp: lastMsg.timestamp
    });
  });

  return conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function openChat(conversationId) {
  activeChatId = conversationId;
  renderConversations();
  renderChatMessages();
  document.getElementById("chat-form").style.display = "flex";
  
  // Update chat title
  const conv = getConversationsForUser().find(c => c.id === conversationId);
  if (conv) {
    document.getElementById("chat-title").textContent = conv.name;
  }
}

function renderChatMessages() {
  const target = document.getElementById("chat-messages");
  target.innerHTML = "";

  if (!activeChatId) {
    target.innerHTML = '<p style="padding: 40px; text-align: center; color: #64748b;">Select a conversation to start messaging</p>';
    return;
  }

  const messages = state.messages.filter(m => m.conversationId === activeChatId);

  messages.forEach(msg => {
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    
    const isSent = msg.senderId === currentUser?.id || 
                   (currentUser?.role === "recruiter" && msg.senderId !== "system" && msg.senderName !== currentUser?.name);
    
    if (isSent) bubble.classList.add("sent");
    
    bubble.innerHTML = `
      <div class="message-sender">${msg.senderName}</div>
      <p class="message-text">${msg.text}</p>
      <div class="message-time">${formatInterviewTime(msg.timestamp)}</div>
    `;
    
    target.appendChild(bubble);
  });

  target.scrollTop = target.scrollHeight;
}

function sendMessage(conversationId, text) {
  const message = {
    id: crypto.randomUUID(),
    conversationId,
    senderId: currentUser.id,
    senderName: currentUser.name,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  state.messages.push(message);
  saveState();
  renderChatMessages();
  renderConversations();
  showToast("Message sent");
}

// ── Toast notifications ──
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = type === "error" ? "var(--danger)" : "var(--green)";
  toast.style.color = type === "error" ? "#fff" : "#07110e";
  toast.style.transform = "translateY(0)";
  toast.style.opacity = "1";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = "translateY(80px)";
    toast.style.opacity = "0";
  }, 3000);
}

function renderAll() {
  if (!currentUser) return;
  renderMetrics();
  renderTopMatches();
  renderCandidateResults();
  renderPipeline();
  renderInterviews();
  renderJobs();
  renderApplications();
  renderConversations();
  renderNavBadges();
  // If messages view is open, refresh chat messages too
  if (currentView === "messages" && activeChatId) renderChatMessages();
  const skillsInput = document.querySelector("[name='skills']");
  if (skillsInput) renderTags(document.getElementById("preview-tags"), parseSkills(skillsInput.value));
}

function renderNavBadges() {
  const appsBadge = document.getElementById("apps-badge");
  const msgsBadge = document.getElementById("msgs-badge");
  if (!appsBadge || !msgsBadge) return;

  // Applications badge — candidate only
  if (currentUser?.role === "candidate") {
    const candidate = state.candidates.find(c => c.name === currentUser.name);
    const count = candidate ? state.applications.filter(a => a.candidateId === candidate.id).length : 0;
    appsBadge.textContent = count;
    appsBadge.style.display = count > 0 ? "inline-flex" : "none";
  } else {
    appsBadge.style.display = "none";
  }

  // Messages badge — count unread (for demo: total conversations)
  const convCount = getConversationsForUser().length;
  msgsBadge.textContent = convCount;
  msgsBadge.style.display = convCount > 0 ? "inline-flex" : "none";
}

function renderMetrics() {
  const matches = state.candidates.map((candidate) => scoreCandidate(candidate, activeJob()));
  const average = matches.length ? Math.round(matches.reduce((sum, score) => sum + score, 0) / matches.length) : 0;

  document.getElementById("metric-candidates").textContent = state.candidates.length;
  document.getElementById("metric-jobs").textContent = state.jobs.length;
  document.getElementById("metric-match").textContent = `${average}%`;
  document.getElementById("metric-interviews").textContent = state.interviews.length;
}

function renderTopMatches() {
  const target = document.getElementById("top-matches");
  target.innerHTML = "";
  state.candidates
    .toSorted((a, b) => scoreCandidate(b, activeJob()) - scoreCandidate(a, activeJob()))
    .slice(0, 3)
    .forEach((candidate) => target.appendChild(createCandidateCard(candidate)));
}

function renderCandidateResults() {
  const target = document.getElementById("candidate-results");
  const query = document.getElementById("candidate-search")?.value?.toLowerCase() || "";
  target.innerHTML = "";

  state.candidates
    .filter((candidate) => {
      const haystack = [candidate.name, candidate.role, ...candidate.skills].join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .toSorted((a, b) => scoreCandidate(b, activeJob()) - scoreCandidate(a, activeJob()))
    .forEach((candidate) => target.appendChild(createCandidateCard(candidate)));
}

function renderPipeline() {
  const board = document.getElementById("pipeline-board");
  board.innerHTML = "";

  pipelineStages.forEach((stage) => {
    const column = document.createElement("section");
    column.className = "pipeline-column";
    const candidates = state.candidates.filter((c) => c.stage === stage);
    column.innerHTML = `<h4>${stage}<span>${candidates.length}</span></h4>`;

    // Drag-and-drop: drop zone
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", () => column.classList.remove("drag-over"));
    column.addEventListener("drop", (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");
      const candidateId = e.dataTransfer.getData("candidateId");
      if (candidateId) moveCandidate(candidateId, stage);
    });

    candidates.forEach((candidate) => {
      const card = document.createElement("article");
      card.className = "pipeline-card";
      card.draggable = true;
      card.dataset.candidateId = candidate.id;

      card.innerHTML = `
        <strong>${candidate.name}</strong>
        <p>${candidate.role} — ${scoreCandidate(candidate, activeJob())}% match</p>
      `;

      // Drag-and-drop: drag source
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("candidateId", candidate.id);
        card.style.opacity = "0.5";
      });
      card.addEventListener("dragend", () => { card.style.opacity = ""; });

      const nextButton = document.createElement("button");
      nextButton.className = "ghost-button small";
      nextButton.type = "button";
      nextButton.textContent = stage === "Offer" ? "✓ Offer Extended" : "Move Next →";
      nextButton.disabled = stage === "Offer";
      // Stop drag from triggering when clicking the button
      nextButton.addEventListener("mousedown", (e) => e.stopPropagation());
      nextButton.draggable = false;
      nextButton.addEventListener("click", (e) => {
        e.stopPropagation();
        moveCandidate(candidate.id, nextStage(stage));
      });
      card.appendChild(nextButton);
      column.appendChild(card);
    });

    board.appendChild(column);
  });
}

function renderInterviews() {
  // Recruiter: full pipeline list
  renderInterviewListInto(
    document.getElementById("interview-list"),
    state.interviews,
    "Open a candidate profile and click Schedule Interview."
  );

  // Candidate: only their own interviews
  const candidateList = document.getElementById("candidate-interview-list");
  if (candidateList && currentUser?.role === "candidate") {
    const me = state.candidates.find(c => c.name === currentUser.name);
    const mine = me ? state.interviews.filter(i => i.candidateId === me.id) : [];
    renderInterviewListInto(candidateList, mine, "No interviews scheduled yet. Recruiters will book a slot when they shortlist you.");
  } else if (candidateList) {
    candidateList.innerHTML = "";
  }
}

function renderInterviewListInto(target, interviews, emptyMessage) {
  if (!target) return;
  target.innerHTML = "";

  if (!interviews.length) {
    const empty = document.createElement("article");
    empty.className = "interview-card";
    empty.innerHTML = `<strong>No interviews scheduled</strong><p>${emptyMessage}</p>`;
    target.appendChild(empty);
    return;
  }

  interviews.forEach((interview) => {
    const card = document.createElement("article");
    card.className = "interview-card-enhanced";

    const gcalLink = buildGoogleCalendarLink(interview);

    card.innerHTML = `
      <strong>${interview.candidateName}</strong>
      <p>${interview.jobTitle}</p>
      <p>📅 ${formatInterviewTime(interview.scheduledAt)}</p>
      <div class="calendar-actions">
        <button class="primary-button small" type="button" data-action="join" style="background:linear-gradient(135deg,var(--danger),var(--violet));color:#fff;">🎥 Join Video Call</button>
        <a class="calendar-link" href="${gcalLink}" target="_blank" rel="noopener">📆 Google Calendar</a>
        <button class="calendar-link" type="button" data-action="ical">⬇ Download .ics</button>
      </div>
    `;

    card.querySelector("[data-action='ical']").addEventListener("click", () => downloadIcal(interview));
    card.querySelector("[data-action='join']").addEventListener("click", () => startVirtualInterview(interview));
    target.appendChild(card);
  });
}

function buildGoogleCalendarLink(interview) {
  const start = new Date(interview.scheduledAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour
  const fmt = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Interview: ${interview.candidateName} — ${interview.jobTitle}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: `VidHire interview scheduled for ${interview.candidateName} applying for ${interview.jobTitle}`,
    location: "Virtual (VidHire Platform)"
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function buildICalBlob(interview) {
  const start = new Date(interview.scheduledAt);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VidHire//Interview//EN",
    "BEGIN:VEVENT",
    `UID:${interview.id}@vidhire`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Interview: ${interview.candidateName} — ${interview.jobTitle}`,
    `DESCRIPTION:VidHire interview for ${interview.jobTitle}`,
    "LOCATION:Virtual (VidHire Platform)",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function downloadIcal(interview) {
  const content = buildICalBlob(interview);
  const blob = new Blob([content], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vidhire-interview-${interview.candidateName.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Virtual Interview Room ───
let interviewRoomStream = null;
let interviewTimerHandle = null;
let interviewStartTime = 0;

async function startVirtualInterview(interview) {
  const dialog = document.getElementById("interview-room-dialog");
  document.getElementById("interview-room-title").textContent =
    `${interview.candidateName} — ${interview.jobTitle}`;

  // Set the "remote" participant info (the other party)
  const candidate = state.candidates.find(c => c.id === interview.candidateId);
  const isRecruiter = currentUser?.role === "recruiter";
  const remoteName = isRecruiter ? candidate?.name : interview.jobTitle;
  document.getElementById("remote-label").textContent = remoteName || "Remote";

  // Reset the remote tile to its default placeholder structure
  const remoteTile = document.getElementById("remote-video-tile");
  remoteTile.innerHTML = `
    <div class="remote-placeholder">
      <div class="avatar-large">${(remoteName || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
      <p>${remoteName || "Other participant"}</p>
      <small style="color:var(--muted);">Demo mode: simulated remote participant</small>
    </div>
    <span class="video-tile-label">${remoteName || "Remote"}</span>
  `;

  // If recruiter and candidate has a recorded video, play it as the remote feed
  if (isRecruiter && candidate?.videoUrl) {
    remoteTile.innerHTML = `
      <video autoplay loop playsinline src="${candidate.videoUrl}"></video>
      <span class="video-tile-label">${remoteName}</span>
    `;
  }

  // Try to start local camera
  try {
    interviewRoomStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("local-video").srcObject = interviewRoomStream;
  } catch {
    showToast("Camera/mic blocked — running in audio-only demo mode", "error");
  }

  // Reset toggle buttons
  document.getElementById("toggle-mic").textContent = "🎤 Mic On";
  document.getElementById("toggle-cam").textContent = "📹 Cam On";

  // Start timer
  interviewStartTime = Date.now();
  document.getElementById("interview-timer").textContent = "00:00";
  clearInterval(interviewTimerHandle);
  interviewTimerHandle = setInterval(updateInterviewTimer, 1000);

  dialog.showModal();
}

function updateInterviewTimer() {
  const elapsed = Math.floor((Date.now() - interviewStartTime) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  document.getElementById("interview-timer").textContent = `${mm}:${ss}`;
}

function endVirtualInterview() {
  if (interviewRoomStream) {
    interviewRoomStream.getTracks().forEach(t => t.stop());
    interviewRoomStream = null;
  }
  clearInterval(interviewTimerHandle);
  interviewTimerHandle = null;
  document.getElementById("interview-room-dialog").close();
  showToast("Interview ended");
}

function toggleMic() {
  if (!interviewRoomStream) return;
  const audioTrack = interviewRoomStream.getAudioTracks()[0];
  if (!audioTrack) return;
  audioTrack.enabled = !audioTrack.enabled;
  document.getElementById("toggle-mic").textContent = audioTrack.enabled ? "🎤 Mic On" : "🔇 Mic Off";
}

function toggleCam() {
  if (!interviewRoomStream) return;
  const videoTrack = interviewRoomStream.getVideoTracks()[0];
  if (!videoTrack) return;
  videoTrack.enabled = !videoTrack.enabled;
  document.getElementById("toggle-cam").textContent = videoTrack.enabled ? "📹 Cam On" : "📷 Cam Off";
}

function createCandidateCard(candidate) {
  const template = document.getElementById("candidate-card-template");
  const node = template.content.firstElementChild.cloneNode(true);
  const score = scoreCandidate(candidate, activeJob());

  node.querySelector(".avatar").textContent = initials(candidate.name);
  node.querySelector("h4").textContent = candidate.name;
  node.querySelector(".candidate-main p").textContent = `${candidate.role} - ${candidate.location}`;
  node.querySelector(".score-ring").textContent = `${score}% match`;
  node.querySelector(".candidate-summary").textContent = matchReason(candidate, activeJob(), score);
  renderTags(node.querySelector(".tag-row"), candidate.skills.slice(0, 5));

  node.querySelector("[data-action='shortlist']").addEventListener("click", () => moveCandidate(candidate.id, "Shortlisted"));
  node.querySelector("[data-action='interview']").addEventListener("click", () => moveCandidate(candidate.id, "Interview"));
  node.querySelector("[data-action='view']").addEventListener("click", () => openCandidateDialog(candidate));
  return node;
}

function openCandidateDialog(candidate) {
  const job = activeJob();
  const score = scoreCandidate(candidate, job);
  const detail = scoreCandidateDetailed(candidate, job);
  activeDialogCandidateId = candidate.id;

  document.getElementById("dialog-name").textContent = `${candidate.name} — ${score}% match`;
  document.getElementById("dialog-summary").textContent = `${candidate.summary} ${matchReason(candidate, job, score)}`;
  renderTags(document.getElementById("dialog-tags"), candidate.skills);
  renderDialogVideo(candidate);

  // Score bar
  document.getElementById("dialog-score-label").textContent = `${score}%`;
  document.getElementById("dialog-score-fill").style.width = `${score}%`;

  // AI factors breakdown
  const factorsEl = document.getElementById("dialog-ai-factors");
  factorsEl.innerHTML = "";
  const factors = [
    { label: "Skill Match", value: `${detail.skillMatch}%` },
    { label: "Semantic Fit", value: `${detail.semantic}%` },
    { label: "Experience", value: `${detail.experience}%` },
    { label: "Video", value: candidate.videoUrl ? "Yes" : "No" },
    { label: "Profile", value: `${detail.profile}%` },
    { label: "KYC", value: candidate.kycVerified ? "✓ Verified" : "Pending" }
  ];
  factors.forEach(f => {
    const el = document.createElement("div");
    el.className = "ai-factor";
    el.innerHTML = `<div class="ai-factor-label">${f.label}</div><div class="ai-factor-value">${f.value}</div>`;
    factorsEl.appendChild(el);
  });

  // Education / experience extras
  if (candidate.education || candidate.workExperience) {
    const extras = [candidate.education, candidate.workExperience].filter(Boolean).join(" · ");
    document.getElementById("dialog-summary").textContent += ` | ${extras}`;
  }

  const questions = [
    `Walk me through a recent ${candidate.role.toLowerCase()} project and the tradeoffs you made.`,
    `Which part of ${job.title} maps best to your experience with ${candidate.skills.slice(0, 2).join(" and ")}?`,
    "How do you communicate blockers when working with cross-functional teams?"
  ];
  const list = document.getElementById("dialog-questions");
  list.innerHTML = "";
  questions.forEach(q => {
    const item = document.createElement("li");
    item.textContent = q;
    list.appendChild(item);
  });

  document.getElementById("profile-dialog").showModal();
}

function scheduleInterview(candidateId) {
  const candidate = state.candidates.find((item) => item.id === candidateId);
  if (!candidate) return;

  const interview = {
    id: crypto.randomUUID(),
    candidateId,
    candidateName: candidate.name,
    role: candidate.role,
    jobTitle: activeJob().title,
    scheduledAt: nextInterviewSlot()
  };

  state.interviews = [interview, ...state.interviews.filter((item) => item.candidateId !== candidateId)];
  moveCandidate(candidateId, "Interview");
  showToast(`Interview scheduled for ${candidate.name} ✓`);
}

function renderDialogVideo(candidate) {
  const target = document.getElementById("dialog-video");
  target.innerHTML = "";
  if (candidate.videoUrl) {
    const video = document.createElement("video");
    video.src = candidate.videoUrl;
    video.controls = true;
    target.appendChild(video);
    return;
  }

  const fallback = document.createElement("div");
  fallback.className = "ai-card";
  fallback.innerHTML = `
    <p class="eyebrow">Video Resume</p>
    <p>${candidate.name} has a video slot ready. Upload a sample from the Candidate flow to demo playback.</p>
  `;
  target.appendChild(fallback);
}

function moveCandidate(id, stage) {
  state.candidates = state.candidates.map((candidate) => (candidate.id === id ? { ...candidate, stage } : candidate));
  saveState();
  renderAll();
}

function activeJob() {
  return state.jobs[0] || seedState.jobs[0];
}

function scoreCandidate(candidate, job) {
  const required = job.skills.map(normalize);
  const candidateSkills = candidate.skills.map(normalize);

  // Factor 1: Exact skill overlap (40 pts)
  const exactOverlap = required.filter(s => candidateSkills.includes(s)).length;
  const exactScore = required.length ? Math.round((exactOverlap / required.length) * 40) : 20;

  // Factor 2: Semantic category overlap (20 pts)
  const semanticScore = semanticMatch(candidate.skills, job.skills);

  // Factor 3: Experience level relevance (15 pts)
  const expScore = experienceScore(candidate.experience, job);

  // Factor 4: Video resume present (12 pts)
  const videoScore = candidate.videoUrl ? 12 : 4;

  // Factor 5: Profile completeness (8 pts)
  const completeness = [candidate.education, candidate.workExperience, candidate.portfolio, candidate.summary.length > 80]
    .filter(Boolean).length;
  const profileScore = Math.round((completeness / 4) * 8);

  // Factor 6: KYC verified (5 pts)
  const kycScore = candidate.kycVerified ? 5 : 0;

  return Math.min(98, exactScore + semanticScore + expScore + videoScore + profileScore + kycScore);
}

// Returns per-factor breakdown for the AI panel
function scoreCandidateDetailed(candidate, job) {
  const required = job.skills.map(normalize);
  const candidateSkills = candidate.skills.map(normalize);
  const exactOverlap = required.filter(s => candidateSkills.includes(s)).length;

  return {
    skillMatch: required.length ? Math.round((exactOverlap / required.length) * 100) : 50,
    semantic: Math.round(semanticMatch(candidate.skills, job.skills) / 20 * 100),
    experience: Math.round(experienceScore(candidate.experience, job) / 15 * 100),
    video: candidate.videoUrl ? 100 : 33,
    profile: Math.round(([candidate.education, candidate.workExperience, candidate.portfolio, candidate.summary.length > 80].filter(Boolean).length / 4) * 100),
    kyc: candidate.kycVerified ? 100 : 0
  };
}

function semanticMatch(candidateSkills, jobSkills) {
  const categories = {
    frontend: ["react", "vue", "angular", "html", "css", "tailwind", "typescript", "javascript", "uidesign", "nextjs"],
    backend: ["nodejs", "nodejs", "python", "java", "express", "fastapi", "spring", "rails", "php"],
    database: ["postgresql", "mysql", "mongodb", "prisma", "redis", "sqlite"],
    design: ["figma", "uxresearch", "designsystems", "prototyping", "sketch", "adobe"],
    devops: ["docker", "kubernetes", "aws", "gcp", "azure", "cicd", "linux"],
    api: ["restapis", "graphql", "apis", "grpc", "websocket"]
  };

  const toCategory = skills => {
    const cats = new Set();
    skills.forEach(s => {
      const n = normalize(s);
      Object.entries(categories).forEach(([cat, words]) => {
        if (words.some(w => n.includes(w) || w.includes(n))) cats.add(cat);
      });
    });
    return cats;
  };

  const jobCats = toCategory(jobSkills);
  const candCats = toCategory(candidateSkills);
  const overlap = [...jobCats].filter(c => candCats.has(c)).length;
  return jobCats.size ? Math.round((overlap / jobCats.size) * 20) : 10;
}

function experienceScore(experience, job) {
  const levels = { "Fresher": 0, "1-2 years": 1, "3-5 years": 2, "5+ years": 3 };
  const level = levels[experience] ?? 1;
  // Reward mid-level slightly more for most roles
  return [8, 12, 15, 13][Math.min(level, 3)];
}

function matchReason(candidate, job, score) {
  const overlap = candidate.skills.filter((skill) => job.skills.map(normalize).includes(normalize(skill)));
  const skillText = overlap.length ? overlap.join(", ") : candidate.skills.slice(0, 2).join(", ");
  return `${score >= 75 ? "Strong" : "Potential"} fit for ${job.title}: matches ${skillText}. AI suggests asking about project ownership, communication style, and recent delivery tradeoffs.`;
}

function generateSummary(role, skills, resumeText) {
  const cleanRole = String(role || "candidate").trim();
  const topSkills = skills.slice(0, 3).join(", ");
  const text = String(resumeText || "").trim();
  const evidence = text ? text.split(/[.!?]/)[0] : "Shows practical delivery experience";
  return `${cleanRole} with ${topSkills || "relevant"} skills. ${evidence}. Video profile helps recruiters assess confidence and communication beyond the PDF.`;
}

function renderTags(target, skills) {
  target.innerHTML = "";
  skills.forEach((skill) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = skill;
    target.appendChild(tag);
  });
}

function renderVideoPreview(url) {
  const target = document.getElementById("video-preview");
  target.innerHTML = "";
  const video = document.createElement("video");
  video.src = url;
  video.controls = true;
  video.muted = true;
  target.appendChild(video);
}

function renderLivePreview(stream) {
  const target = document.getElementById("video-preview");
  target.innerHTML = "";
  const video = document.createElement("video");
  video.srcObject = stream;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  target.appendChild(video);
}

function renderEmptyVideoPreview() {
  const target = document.getElementById("video-preview");
  target.innerHTML = "<span>Video preview</span>";
}

function parseSkills(value) {
  return String(value || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function extractSkillsFromText(value) {
  const text = String(value || "").toLowerCase();
  const knownSkills = [
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Tailwind",
    "REST APIs",
    "GraphQL",
    "Figma",
    "UX Research",
    "Design Systems",
    "Accessibility",
    "Performance",
    "Dashboard",
    "Product"
  ];

  return knownSkills.filter((skill) => text.includes(normalizeSkillText(skill)));
}

function normalizeSkillText(value) {
  return String(value).toLowerCase().replace("rest apis", "apis");
}

function normalize(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9+#.]/g, "");
}

function initials(name) {
  return String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function nextStage(stage) {
  const index = pipelineStages.indexOf(stage);
  return pipelineStages[Math.min(index + 1, pipelineStages.length - 1)];
}

function nextInterviewSlot() {
  const date = new Date();
  date.setDate(date.getDate() + 1 + state.interviews.length);
  date.setHours(10, 30, 0, 0);
  return date.toISOString();
}

function formatInterviewTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
