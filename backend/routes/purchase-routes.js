const express = require("express");
const router = express.Router();

const purchaseController = require('../controller/purchase-controller');

router.post('/', purchaseController.createPurchase);
router.put('/:id/cancel', purchaseController.cancelPurchase);

module.exports = router;