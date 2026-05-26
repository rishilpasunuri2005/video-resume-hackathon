const { readJsonBody, extractSkillsFromText } = require("./_lib");

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(request);
    return response.status(200).json({ skills: extractSkillsFromText(body.text) });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};
