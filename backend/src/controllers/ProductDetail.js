// ProductDetail controller
const getProductDetail = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Product detail for id ${id}` });
};

module.exports = { getProductDetail };