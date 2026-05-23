const fs = require("fs");
const Invoice = require("../models/Invoice");
const { GoogleGenAI } = require("@google/genai");

// Automatically reads process.env.GEMINI_API_KEY from your environment configurations
const ai = new GoogleGenAI({});

const uploadInvoice = async (req, res) => {
  try {
    // 1. Safety Guard: Verify file upload actually exists
    if (!req.file) {
      return res.status(400).json({ message: "No invoice or receipt file uploaded." });
    }

    // 2. Read the file path into a binary buffer for multi-modal analysis
    const fileBuffer = fs.readFileSync(req.file.path);
    
    const filePart = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    // 3. Craft a highly generalized prompt instructing the model how to structure its brain mapping
    const structuredAiPrompt = `
      Analyze this invoice/receipt document. Carefully extract all the relevant structural details.
      
      CRITICAL CATEGORIZATION RULES:
      Map the transaction into exactly one of these general business buckets based on its contents:
      - "Food & Beverage": Cafes, diners, groceries, food delivery apps, restaurants.
      - "Travel": Rideshares (Uber/Lyft), fuel, train/flight tickets, parking, tolls.
      - "Shopping": E-commerce, apparel retail stores, electronics.
      - "Bills": Electric, water, rent, mobile recharges, internet services, insurance premiums.
      - "Entertainment": Subscriptions (Netflix/Spotify), movies, gaming platforms, event tickets.
      - "Office Supplies": Paper, stationary, courier shipping, workspace software (SaaS).
      - "Other": Only use if it absolutely matches no general category descriptions above.

      BUDGETING/RECOMMENDATION RULE:
      Evaluate the extracted total amount against typical spending targets. 
      Generate a dynamic 1-2 sentence recommendation advising the user on whether this spending is balanced or excessive for its respective category.

      Return the output STRICTLY as a valid JSON object matching the keys below. 
      Do NOT wrap the response in markdown blocks like \`\`\`json. Return pure raw JSON string text only:
      {
        "merchant": "Name of the business or merchant",
        "date": "Extracted transaction date string",
        "amount": 1240,
        "tax": 120,
        "category": "The specific matching category string chosen from the rule list above",
        "items": [
          { "name": "Item Name/Description", "price": 320 }
        ],
        "aiInsight": "Your personalized 1-2 sentence budget insight text string goes here"
      }
    `;

    // 4. Dispatch multi-modal data array to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [filePart, structuredAiPrompt],
    });

    // 5. Clean and parse the raw AI string directly into a JavaScript Object
    const rawText = response.text.trim();
    const parsedData = JSON.parse(rawText);

    // 6. Persist the record in MongoDB Atlas mapped directly to the logged-in user
    const invoice = await Invoice.create({
      user: req.user._id, // Set securely from your JWT auth check middleware!
      merchant: parsedData.merchant || "Unknown Merchant",
      amount: Number(parsedData.amount) || 0,
      tax: Number(parsedData.tax) || 0,
      date: parsedData.date || "Unknown Date",
      category: parsedData.category || "Other",
      items: parsedData.items || [],
      aiInsight: parsedData.aiInsight,
      fileUrl: req.file.path // Path to file stored locally in your /uploads folder
    });

    // 7. Return the MongoDB document straight back to your React/Flutter UI dashboard
    res.status(201).json({
      success: true,
      message: "Invoice successfully analyzed by AI",
      invoice
    });

  } catch (error) {
    console.error("Generalized Processor Error Log:", error);
    
    // Catch JSON parsing errors or schema casting exceptions safely
    res.status(500).json({
      message: "Invoice processing failed",
      error: error.message
    });
  }
};

module.exports = {
  uploadInvoice
};