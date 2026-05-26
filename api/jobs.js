const { getState, setState, readJsonBody, randomUUID } = require("./_lib");

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(request);
    const state = getState();
    const job = { ...body, id: randomUUID() };
    state.jobs = [job, ...state.jobs];
    setState(state);
    return response.status(201).json(job);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};
