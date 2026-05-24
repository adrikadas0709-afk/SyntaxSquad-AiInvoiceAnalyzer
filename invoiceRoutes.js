const express = require("express");
const router = express.Router();

// file upload middleware
const upload = require("../services/fileService");

// controller function
const { uploadInvoice } = require("../controllers/invoiceController");

// POST route
router.post(
    "/upload",
    upload.single("invoice"),
    uploadInvoice
);

module.exports = router;