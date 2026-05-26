// Real AI candidate matching via Groq.
// Falls back to local heuristic scoring if GROQ_API_KEY is missing or the call fails.

const { readJsonBody } = require("./_lib");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { candidate, job } = await readJsonBody(request);
    if (!candidate || !job) {
      return response.status(400).json({ error: "Missing candidate or job" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return response.status(200).json({
        ok: false,
        provider: "fallback",
        reason: "GROQ_API_KEY not configured"
      });
    }

    const prompt = buildPrompt(candidate, job);

    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior tech recruiter assistant. You analyze candidate-to-job fit and respond ONLY with valid JSON matching this schema exactly: " +
              '{"score": <integer 0-100>, "summary": "<2-sentence fit summary>", "strengths": ["string", ...], "concerns": ["string", ...], "questions": ["string", "string", "string"]}. ' +
              "Be honest, specific, and reference actual skills from the candidate."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return response.status(200).json({
        ok: false,
        provider: "fallback",
        reason: `Groq API error ${groqResponse.status}: ${errorText.slice(0, 200)}`
      });
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return response.status(200).json({
        ok: false,
        provider: "fallback",
        reason: "AI returned malformed JSON"
      });
    }

    return response.status(200).json({
      ok: true,
      provider: "groq",
      model: MODEL,
      score: clampScore(parsed.score),
      summary: String(parsed.summary || "").slice(0, 500),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns.slice(0, 5) : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5) : []
    });
  } catch (error) {
    return response.status(200).json({
      ok: false,
      provider: "fallback",
      reason: error.message
    });
  }
};

function buildPrompt(candidate, job) {
  return [
    `Job Title: ${job.title}`,
    `Company: ${job.company}`,
    `Required Skills: ${(job.skills || []).join(", ")}`,
    `Job Description: ${job.description || "—"}`,
    "",
    `Candidate Name: ${candidate.name}`,
    `Candidate Role: ${candidate.role}`,
    `Experience: ${candidate.experience}`,
    `Location: ${candidate.location || "—"}`,
    `Skills: ${(candidate.skills || []).join(", ")}`,
    `Education: ${candidate.education || "—"}`,
    `Work Experience: ${candidate.workExperience || "—"}`,
    `Resume Summary: ${candidate.summary || "—"}`,
    `Has Video Resume: ${candidate.videoUrl ? "Yes" : "No"}`,
    `Identity Verified (KYC): ${candidate.kycVerified ? "Yes" : "No"}`,
    "",
    "Score the candidate-job fit 0-100 considering skill match, experience level, profile completeness, and likely culture fit. Return only the JSON object."
  ].join("\n");
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}
