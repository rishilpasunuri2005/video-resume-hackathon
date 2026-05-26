const { getState, setState, readJsonBody, randomUUID, nextInterviewSlot } = require("./_lib");

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(request);
    const state = getState();
    const candidate = state.candidates.find(c => c.id === body.candidateId);

    if (!candidate) {
      return response.status(404).json({ error: "Candidate not found" });
    }

    const interview = {
      id: randomUUID(),
      candidateId: candidate.id,
      candidateName: candidate.name,
      role: candidate.role,
      jobTitle: state.jobs[0]?.title || "Interview",
      scheduledAt: body.scheduledAt || nextInterviewSlot(state.interviews.length)
    };

    state.interviews = [interview, ...state.interviews.filter(i => i.candidateId !== candidate.id)];
    state.candidates = state.candidates.map(c =>
      c.id === candidate.id ? { ...c, stage: "Interview" } : c
    );
    setState(state);

    return response.status(201).json({ interview, state });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};
