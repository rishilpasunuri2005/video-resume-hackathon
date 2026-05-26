const { getState, setState, readJsonBody } = require("./_lib");

module.exports = async (request, response) => {
  if (request.method === "GET") {
    return response.status(200).json(getState());
  }

  if (request.method === "PUT") {
    try {
      const body = await readJsonBody(request);
      setState(body);
      return response.status(200).json(getState());
    } catch (error) {
      return response.status(400).json({ error: error.message });
    }
  }

  response.setHeader("Allow", "GET, PUT");
  return response.status(405).json({ error: "Method not allowed" });
};
