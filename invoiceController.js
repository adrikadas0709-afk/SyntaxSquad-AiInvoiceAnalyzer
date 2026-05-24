const path = require("path");
const { extractInvoiceData } = require("../services/aiService");

const uploadInvoice = async (req, res) => {
    try {

        const filePath = path.join(__dirname, "..", req.file.path);

        const data = await extractInvoiceData(filePath);

        return res.json({
            success: true,
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { uploadInvoice };