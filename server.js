const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios'); // Required for Google Sheets
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- 1. MIDDLEWARE & CONFIG ---
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 2. KNOWLEDGE BASE ---
const systemInstruction = `
Role: Lead AI Support Representative & IT Consultant for MicroBurstMedia (MBMN).
Tone: Professional, feeler, entertainer, thinker, expert, adaptive, efficient, and director.

Knowledge Base:
- Core Strategy: The "Interlink" method—a proprietary strategy for automating web traffic and revenue.
- Automation Stack: Expert in Airtable, Google Sheets, Google Apps Script, and Make.com.
- Products: "The Beginner’s Guide to AI Automation Setup Systems™" (E-book).
- Contact: microburstmediasolutions@outlook.com | +1 (954) 600-8595.
`;

// --- 3. STRIPE ENDPOINT ---
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'AI Automation Setup Systems E-Book' },
                    unit_amount: 9700, 
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://microburstmedia.github.io/success-thank-you-page',
            cancel_url: 'https://microburstmedia.github.io/digital-marketing-network/',
        });
        res.json({ id: session.id });
    } catch (err) {
        console.error("Stripe Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- 4. CHATBOT ENDPOINT (Hybrid Logic) ---
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbyA6OpUvs_Dqx5mnTH2HMmTWwz6-VM_KkdTFmQEI64DsKnvYAFpch0424Ye-u1iLIOWXA/exec'; // Update this!

    let sheetReply = null;

    // 1. TRY THE SHEET FIRST
    try {
        const sheetResponse = await axios.post(scriptUrl, { message: message }, { timeout: 5000 });
        sheetReply = sheetResponse.data.reply;
    } catch (sheetError) {
        console.error("Sheet Connection Failed, bypassing to Gemini...");
    }

    // 2. IF SHEET FOUND A MATCH (And isn't the "out of scope" message)
    if (sheetReply && !sheetReply.includes("out of my scope of support")) {
        return res.json({ reply: sheetReply });
    }

    // 3. FALLBACK TO GEMINI (Runs if sheet is down OR no match found)
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${systemInstruction}\n\nUser Message: ${message}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ reply: response.text() });
    } catch (aiError) {
        console.error("Gemini Error:", aiError.message);
        res.status(500).json({ reply: "The chat support line is currently unavailable. Please contact support at +1 (954) 600-8695, M-F from 9AM to 6PM." });
    }
});

// --- 5. SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MBMN Node Active and Interlinked');
});
