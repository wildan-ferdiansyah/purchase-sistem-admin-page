const db = require("../config/db");

const getAllProducts = (req, res) => {
  const query = `
    SELECT
      p.id,
      p.name,
      p.price,
      s.stock
    FROM products p
    JOIN product_stocks s ON s.product_id = p.id
    ORDER BY p.id ASC
  `;

  db.query(query, (err, datas) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Failed to fetch products",
      });
    }

    res.status(200).json({
      message: "Products fetched successfully",
      data: datas,
    })
  });
};

module.exports = {
  getAllProducts,
};
