const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadInvoice,
  getInvoices,
  getInvoiceById,
  deleteInvoice
} = require("../controllers/invoiceController");

// POST: Upload & Parse an Invoice
router.post(
  "/upload",
  protect,
  (req, res, next) => {
    // Intercept Multer validation errors (e.g., file too large, wrong format)
    upload.single("invoice")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  uploadInvoice
);

// GET: Fetch all historical records for the logged-in user
router.get("/", protect, getInvoices);

// GET: Fetch a single invoice detail view
router.get("/:id", protect, getInvoiceById);

// DELETE: Erase a document record from the system
router.delete("/:id", protect, deleteInvoice);

module.exports = router;