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

const cancelPurchase = (req, res) => {
  const purchaseId = req.params.id;

  const queryGetPurchase = `
    SELECT product_id, quantity, status
    FROM purchases
    WHERE id = ?  
  `;

  db.query(queryGetPurchase, [purchaseId], (err, datas) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to fetch purchase",
      });
    }

    if (datas.length === 0) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    const purchases = datas[0];

    if (purchases.status === "CANCELLED") {
      return res.status(400).json({
        message: "Purchase already cancelled",
      });
    }

    const queryUpdatePurchase = `
      UPDATE purchases
      SET status = 'CANCELLED'
      WHERE id = ?
    `;

    db.query(queryUpdatePurchase, [purchaseId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Failed to cancel purchase",
        });
      }

      const queryRestockStock = `
        UPDATE product_stocks
        SET stock = stock + ?
        WHERE product_id = ?
      `;

      db.query(queryRestockStock, [purchases.quantity, purchases.product_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            message: "Failed to restock stock",
          });
        }

        res.status(200).json({
          message: "Purchase cancelled successfully",
        })
      });
    })
  });
};

module.exports = {
  createPurchase,
  cancelPurchase,
};
