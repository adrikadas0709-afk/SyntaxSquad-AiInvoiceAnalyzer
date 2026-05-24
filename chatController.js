// controllers/chatController.js

const {
    GoogleGenerativeAI
} = require("@google/generative-ai");

// Retry with exponential backoff - respects the retryDelay from the API error
const generateWithRetry = async (model, prompt, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            const is429 = error.message?.includes("429") || error.status === 429;
            if (is429 && attempt < maxRetries) {
                // Extract retry delay from error if available (e.g. "49s"), else use backoff
                const retryMatch = error.message?.match(/retry in (\d+)/i);
                const delayMs = retryMatch
                    ? parseInt(retryMatch[1]) * 1000
                    : attempt * 5000; // 5s, 10s, 15s
                console.log(`[Retry ${attempt}/${maxRetries}] Rate limited. Waiting ${delayMs / 1000}s...`);
                await new Promise(r => setTimeout(r, delayMs));
            } else {
                throw error;
            }
        }
    }
};

// chatbot controller
const askChatbot = async (req, res) => {

    try {

        // initialize Gemini inside handler so dotenv is guaranteed to have run
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Use gemini-2.5-flash
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        // get user question
        const question = req.body.question;

        // validation
        if (!question) {
            return res.status(400).json({
                success: false,
                error: "Question is required"
            });
        }

        // sample invoice summary
        const invoiceSummary = `
        
        Food Expense: ₹5000
        Shopping Expense: ₹7000
        Travel Expense: ₹2000
        Subscription Expense: ₹1000
        Rent Expense: ₹10000
        
        Total Expense: ₹25000
        
        `;

        // AI prompt
        const prompt = `
        
        You are an AI financial assistant.

        Analyze the invoice summary.

        Invoice Summary:
        ${invoiceSummary}

        User Question:
        ${question}

        Give short smart answers.
        
        `;

        // generate AI response with retry logic
        const result = await generateWithRetry(model, prompt);

        // get text response
        const response = await result.response;
        const text = response.text();

        // send response
        res.status(200).json({
            success: true,
            question,
            reply: text
        });

    } catch (error) {

        console.log("CHATBOT ERROR =>", error.message);

        // Give a friendlier message for quota errors
        const is429 = error.message?.includes("429") || error.message?.includes("quota");
        res.status(is429 ? 429 : 500).json({
            success: false,
            error: is429
                ? "AI quota limit reached. Please wait a minute and try again, or upgrade your Gemini API plan."
                : error.message
        });
    }
};

// export controller
module.exports = {
    askChatbot
};