const { getState, setState, readJsonBody, randomUUID } = require("./_lib");

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(request);
    const state = getState();
    const candidate = { ...body, id: randomUUID(), stage: "Applied" };
    state.candidates = [candidate, ...state.candidates.filter(item => item.name !== candidate.name)];
    setState(state);
    return response.status(201).json(candidate);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};
