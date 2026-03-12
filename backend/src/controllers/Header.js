// Header controller
const getHeader = (req, res) => {
  res.json({ message: 'Header data' });
};

module.exports = { getHeader };