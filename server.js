const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const PORT = Number(process.env.PORT || 5174);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

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
      skills: ["React", "TypeScript", "APIs", "Tailwind"],
      description:
        "Looking for a frontend developer who can build polished interfaces, consume APIs, collaborate with design, and communicate clearly."
    },
    {
      id: "job-fullstack",
      title: "Full Stack Developer",
      company: "TechVentures Inc",
      skills: ["Node.js", "React", "PostgreSQL", "APIs"],
      description:
        "Seeking a full stack developer to build scalable web applications with modern tech stack."
    },
    {
      id: "job-designer",
      title: "UI/UX Designer",
      company: "DesignHub",
      skills: ["Figma", "UX Research", "Design Systems"],
      description:
        "Looking for a creative designer to craft beautiful and intuitive user experiences."
    }
  ]
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    await serveStatic(response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { error: "Internal server error", detail: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`VidHire backend running at http://localhost:${PORT}`);
});

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, service: "vidhire-backend" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/state") {
    sendJson(response, 200, await readState());
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/state") {
    const body = await readJsonBody(request);
    const state = normalizeState(body);
    await writeState(state);
    sendJson(response, 200, state);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/reset") {
    const state = clone(seedState);
    await writeState(state);
    sendJson(response, 200, state);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/candidates") {
    const state = await readState();
    const candidate = { ...(await readJsonBody(request)), id: randomUUID(), stage: "Applied" };
    state.candidates = [candidate, ...state.candidates.filter((item) => item.name !== candidate.name)];
    await writeState(state);
    sendJson(response, 201, candidate);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/jobs") {
    const state = await readState();
    const job = { ...(await readJsonBody(request)), id: randomUUID() };
    state.jobs = [job, ...state.jobs];
    await writeState(state);
    sendJson(response, 201, job);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/interviews") {
    const state = await readState();
    const body = await readJsonBody(request);
    const candidate = state.candidates.find((item) => item.id === body.candidateId);
    if (!candidate) {
      sendJson(response, 404, { error: "Candidate not found" });
      return;
    }

    const interview = {
      id: randomUUID(),
      candidateId: candidate.id,
      candidateName: candidate.name,
      role: candidate.role,
      jobTitle: state.jobs[0]?.title || "Interview",
      scheduledAt: body.scheduledAt || nextInterviewSlot(state.interviews.length)
    };

    state.interviews = [interview, ...state.interviews.filter((item) => item.candidateId !== candidate.id)];
    state.candidates = state.candidates.map((item) => (item.id === candidate.id ? { ...item, stage: "Interview" } : item));
    await writeState(state);
    sendJson(response, 201, { interview, state });
    return;
  }

  const stageMatch = url.pathname.match(/^\/api\/candidates\/([^/]+)\/stage$/);
  if (request.method === "PATCH" && stageMatch) {
    const state = await readState();
    const body = await readJsonBody(request);
    const candidateId = decodeURIComponent(stageMatch[1]);
    state.candidates = state.candidates.map((item) => (item.id === candidateId ? { ...item, stage: body.stage } : item));
    await writeState(state);
    sendJson(response, 200, state);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/parse-skills") {
    const body = await readJsonBody(request);
    sendJson(response, 200, { skills: extractSkillsFromText(body.text) });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

async function serveStatic(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(ROOT, safePath));

  if (!filePath.startsWith(ROOT)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
    response.end(file);
  } catch {
    sendText(response, 404, "Not found");
  }
}

async function readState() {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return normalizeState(JSON.parse(raw));
}

async function writeState(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, `${JSON.stringify(normalizeState(state), null, 2)}\n`, "utf8");
}

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await writeState(clone(seedState));
  }
}

function normalizeState(state) {
  return {
    users: Array.isArray(state?.users) ? state.users : clone(seedState.users || []),
    candidates: Array.isArray(state?.candidates) ? state.candidates : clone(seedState.candidates),
    interviews: Array.isArray(state?.interviews) ? state.interviews : [],
    applications: Array.isArray(state?.applications) ? state.applications : [],
    messages: Array.isArray(state?.messages) ? state.messages : [],
    jobs: Array.isArray(state?.jobs) ? state.jobs : clone(seedState.jobs)
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, message) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nextInterviewSlot(offset) {
  const date = new Date();
  date.setDate(date.getDate() + 1 + offset);
  date.setHours(10, 30, 0, 0);
  return date.toISOString();
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
