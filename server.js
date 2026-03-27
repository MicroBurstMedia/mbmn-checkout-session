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
Role: Lead AI Strategist & IT Consultant for MicroBurstMedia (MBMN).
Tone: Professional, expert, adaptive, and efficient.

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
    try {
        const { message } = req.body;
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbyA6OpUvs_Dqx5mnTH2HMmTWwz6-VM_KkdTFmQEI64DsKnvYAFpch0424Ye-u1iLIOWXA/exec';

        // 1. CALL THE "OPERATOR" (Google Sheets) FIRST
        const sheetResponse = await axios.post(scriptUrl, { message: message });
        const sheetReply = sheetResponse.data.reply;

        // 2. CHECK IF THE SHEET GAVE A VALID RESPONSE
        // Note: Make sure this check matches the "No match" phrase in your Google Apps Script
        if (sheetReply && !sheetReply.includes("I'm not sure about that")) {
            return res.json({ reply: sheetReply });
        }

        // 3. IF NO SHEET MATCH, USE GEMINI AS THE BACKUP
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${systemInstruction}\n\nUser Message: ${message}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ reply: response.text() });

    } catch (err) {
        console.error("System Error:", err.message);
        res.status(500).json({ reply: "The system is currently busy. Please try again in a moment." });
    }
});

// --- 5. SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MBMN Node Active and Interlinked');
});
