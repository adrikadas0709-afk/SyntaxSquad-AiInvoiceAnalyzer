const fs = require("fs");
const pdfParse = require("pdf-parse-debugging-disabled");
const Tesseract = require("tesseract.js");


// RAG MEMORY

const memory = [];


// CLEAN TEXT

const cleanText = (text = "") => {
    return text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/[ ]{2,}/g, " ")
        .replace(/\n{2,}/g, "\n")
        .trim();
};


// RAG EMBEDDING (LIGHT WEIGHT)

const embed = (text) => {
    const map = {};
    text.toLowerCase().split(/\s+/).forEach(w => {
        map[w] = (map[w] || 0) + 1;
    });
    return map;
};

const similarity = (a, b) => {
    let dot = 0, ma = 0, mb = 0;

    for (let k in a) {
        ma += a[k] * a[k];
        if (b[k]) dot += a[k] * b[k];
    }

    for (let k in b) mb += b[k] * b[k];

    return dot / (Math.sqrt(ma) * Math.sqrt(mb) + 1e-9);
};


//STORE MEMORY

const storeMemory = (data, text) => {
    memory.push({
        vector: embed(text),
        data
    });
};


//GET SIMILAR INVOICES (RAG)

const getSimilar = (text) => {
    const v = embed(text);

    return memory
        .map(m => ({
            score: similarity(v, m.vector),
            data: m.data
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(x => x.data);
};


// INVOICE NUMBER

const getInvoiceNumber = (text) => {
    const m = text.match(/invoice\s*(no|number)?\s*[:\-]?\s*([A-Z0-9\-\/]+)/i);
    return m ? m[2] : null;
};


// CUSTOMER (STRICT)

const getCustomerName = (lines) => {
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i].toLowerCase();

        if (l.includes("bill to") || l.includes("customer")) {
            for (let j = i + 1; j < i + 4; j++) {
                const v = lines[j];
                if (
                    v &&
                    v.length > 3 &&
                    v.length < 50 &&
                    /^[A-Z][a-zA-Z .&-]+$/.test(v)
                ) {
                    return v;
                }
            }
        }
    }
    return null;
};


// SELLER

const getSellerName = (lines) => {
    for (let i = 0; i < 20; i++) {
        const v = lines[i];

        if (
            v &&
            v.length > 5 &&
            v.length < 80 &&
            /[A-Za-z]/.test(v) &&
            !/invoice|tax|original|thank/i.test(v)
        ) {
            return v;
        }
    }
    return null;
};


// AMOUNT (FIXED SMART PICK)

const extractAmount = (text) => {
    const nums = text.match(/\b\d{2,7}(\.\d{1,2})?\b/g);
    if (!nums) return null;

    const values = nums
        .map(Number)
        .filter(n => n > 50 && n < 100000);

    return values.length ? Math.max(...values) : null;
};


// DATE EXTRACTION

const extractDates = (text, lines) => {
    const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;

    const find = (keys) => {
        for (let i = 0; i < lines.length; i++) {
            if (keys.some(k => lines[i].toLowerCase().includes(k))) {
                const m = lines[i].match(dateRegex);
                if (m) return m[0];
                if (lines[i + 1]?.match(dateRegex)) return lines[i + 1].match(dateRegex)[0];
            }
        }
        return null;
    };

    return {
        invoice_date: find(["invoice date", "bill date"]),
        due_date: find(["due date"]),
        challan_date: find(["challan date"])
    };
};


// FINANCIAL ANALYSIS (NO AI)

const analyzeFinance = (text, amount, similar) => {

    const t = text.toLowerCase();

    let category = "Others";

    if (t.includes("food") || t.includes("restaurant")) category = "Food";
    else if (t.includes("uber") || t.includes("taxi")) category = "Transport";
    else if (t.includes("amazon")) category = "Shopping";
    else if (t.includes("electricity")) category = "Utilities";
    else if (t.includes("hotel")) category = "Travel";

    const pastSpent = similar.reduce((s, x) => s + (x.total_amount || 0), 0);
    const count = similar.length;

    let decision = "BUY";
    let reason = "Normal spending";

    if (amount > 10000) {
        decision = "CAUTION";
        reason = "High value transaction";
    }

    if (count > 5 && pastSpent > 20000) {
        decision = "AVOID";
        reason = "Repeated high spending detected";
    }

    return {
        category,
        decision,
        reason,
        past_transactions: count,
        total_spent_in_category: pastSpent,
        total_amount_numeric: amount || 0
    };
};


// MAIN FUNCTION

const extractInvoiceData = async (filePath) => {

    let text = "";

    if (filePath.endsWith(".pdf")) {
        const buffer = fs.readFileSync(filePath);
        const pdf = await pdfParse(buffer);
        text = pdf?.text || "";
    } else {
        const result = await Tesseract.recognize(filePath, "eng", {
            logger: () => {}
        });
        text = result?.data?.text || "";
    }

    const clean = cleanText(text);
    const lines = clean.split("\n").map(l => l.trim()).filter(Boolean);

    // 🔍 RAG
    const similar = getSimilar(clean);

    // 🧠 EXTRACTION (AI BASED)
    let data = {
        invoice_number: null,
        invoice_date: null,
        customer_name: null,
        seller_name: null,
        total_amount: null
    };

    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const fileExt = filePath.split('.').pop().toLowerCase();
        let mimeType = "image/jpeg";
        if (fileExt === "png") mimeType = "image/png";
        else if (fileExt === "webp") mimeType = "image/webp";
        else if (fileExt === "pdf") mimeType = "application/pdf";
        
        const filePart = {
            inlineData: {
                data: fs.readFileSync(filePath).toString("base64"),
                mimeType
            }
        };

        const prompt = `Extract the following information from this invoice. 
Return ONLY a valid JSON object with the following keys. Do not include any markdown formatting or \`\`\`json tags.
- invoice_number (string or null)
- invoice_date (string or null)
- customer_name (string or null)
- seller_name (string or null)
- total_amount (number or null)`;

        let result;
        let maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                result = await model.generateContent([prompt, filePart]);
                break; // success
            } catch (error) {
                const is429 = error.message?.includes("429") || error.status === 429;
                if (is429 && attempt < maxRetries) {
                    console.log(`[Invoice AI Retry ${attempt}/${maxRetries}] Rate limited. Waiting...`);
                    await new Promise(r => setTimeout(r, attempt * 4000));
                } else {
                    throw error;
                }
            }
        }

        let responseText = result.response.text().trim();
        
        if (responseText.startsWith("```json")) {
            responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (responseText.startsWith("```")) {
            responseText = responseText.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const aiData = JSON.parse(responseText);
        data = {
            invoice_number: aiData.invoice_number || null,
            invoice_date: aiData.invoice_date || null,
            customer_name: aiData.customer_name || null,
            seller_name: aiData.seller_name || null,
            total_amount: aiData.total_amount ? Number(aiData.total_amount) : null
        };
    } catch (error) {
        console.error("AI Extraction failed, falling back to rule-based:", error.message);
        data = {
            invoice_number: getInvoiceNumber(clean),
            invoice_date: extractDates(clean, lines).invoice_date,
            customer_name: getCustomerName(lines),
            seller_name: getSellerName(lines),
            total_amount: extractAmount(clean)
        };
    }

    // FINANCE AI
    const finance_analysis = analyzeFinance(clean, data.total_amount, similar);

    const finalData = {
        ...data,
        finance_analysis
    };

    // STORE IN RAG
    storeMemory(finalData, clean);

    return {
        success: true,
        data: finalData,
        rawText: clean
    };
};

module.exports = { extractInvoiceData };
