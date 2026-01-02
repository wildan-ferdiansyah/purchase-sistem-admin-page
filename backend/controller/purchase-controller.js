const db = require("../config/db");

const createPurchase = (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({
      message: "Invalid product id or quantity",
    });
  }

  const queryCheckStock = `
    SELECT stock
    FROM product_stocks
    WHERE product_id = ?
  `;

  db.query(queryCheckStock, ["product_id"], (err, datas) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Failed to check stock",
      });
    }

    if (datas.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const stock = datas[0].stock;

    if (stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
      });
    }

    const queryinsertPurchase = `
      INSERT INTO purchases (product_id, quantity, status)
      VALUES (?, ?, 'PURCHASED')
    `;

    db.query(queryinsertPurchase, [product_id, quantity], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Failed to create purchase",
        });
      }

      const queryUpdateStock = `
        UPDATE product_stocks 
        SET stock = stock - ? 
        WHERE product_id = ?
      `;

      db.query(queryUpdateStock, [quantity, product_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Failed to update stock",
          });
        }

        res.status(200).json({
          message: "Purchase created successfully",
        });
      });
    });
  });
};

module.exports = {
  createPurchase,
};
