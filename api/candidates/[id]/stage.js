const { getState, setState, readJsonBody } = require("../../_lib");

module.exports = async (request, response) => {
  if (request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(request);
    const candidateId = request.query.id;
    const state = getState();

    state.candidates = state.candidates.map(item =>
      item.id === candidateId ? { ...item, stage: body.stage } : item
    );
    setState(state);

    return response.status(200).json(state);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};
