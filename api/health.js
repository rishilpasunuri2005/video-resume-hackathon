module.exports = (request, response) => {
  response.status(200).json({ ok: true, service: "vidhire-backend" });
};
