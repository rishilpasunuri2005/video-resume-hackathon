// Shared state and helpers for Vercel serverless functions.
// Note: serverless instances are stateless across cold starts.
// For a hackathon demo, the frontend already falls back to localStorage,
// so persistence still feels seamless to the user.

const { randomUUID } = require("node:crypto");

const seedState = {
  users: [
    { id: "user-1", email: "candidate@demo.com", password: "demo123", name: "Aarav Mehta", role: "candidate" },
    { id: "user-2", email: "recruiter@demo.com", password: "demo123", name: "Priya Sharma", role: "recruiter" }
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

// Module-level state. Persists across warm serverless invocations,
// resets on cold start. Frontend localStorage covers the gap.
let state = clone(seedState);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getState() {
  return state;
}

function setState(next) {
  state = normalizeState(next);
}

function resetState() {
  state = clone(seedState);
  return state;
}

function normalizeState(input) {
  return {
    users: Array.isArray(input?.users) ? input.users : clone(seedState.users),
    candidates: Array.isArray(input?.candidates) ? input.candidates : clone(seedState.candidates),
    interviews: Array.isArray(input?.interviews) ? input.interviews : [],
    applications: Array.isArray(input?.applications) ? input.applications : [],
    messages: Array.isArray(input?.messages) ? input.messages : [],
    jobs: Array.isArray(input?.jobs) ? input.jobs : clone(seedState.jobs)
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    if (request.body && typeof request.body === "object") {
      resolve(request.body);
      return;
    }

    let raw = "";
    request.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function nextInterviewSlot(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + 1 + offset);
  date.setHours(10, 30, 0, 0);
  return date.toISOString();
}

function extractSkillsFromText(value) {
  const text = String(value || "").toLowerCase();
  const knownSkills = [
    "React", "TypeScript", "JavaScript", "Node.js", "PostgreSQL", "Prisma",
    "Tailwind", "REST APIs", "GraphQL", "Figma", "UX Research", "Design Systems",
    "Accessibility", "Performance", "Dashboard", "Product"
  ];
  const norm = s => String(s).toLowerCase().replace("rest apis", "apis");
  return knownSkills.filter(skill => text.includes(norm(skill)));
}

module.exports = {
  randomUUID,
  getState,
  setState,
  resetState,
  normalizeState,
  readJsonBody,
  nextInterviewSlot,
  extractSkillsFromText,
  clone
};
