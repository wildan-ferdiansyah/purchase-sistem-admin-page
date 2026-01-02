const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/products", require("./routes/product-routes"));
app.use('/purchases', require('./routes/purchase-routes'));

module.exports = app;
