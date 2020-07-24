const fetchInfo = require("../src/fetch");
const renderInfo = require("../src/render");
module.exports = async (req, res) => {
  const { username, theme } = req.query;
  let info;
  try {
    info = await fetchInfo(username);
  } catch (err) {
    return res.send(renderError(err.message));
  }
  res.send(renderInfo(info, {}));
};
