const { resetState } = require("./_lib");

module.exports = (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }
  return response.status(200).json(resetState());
};
