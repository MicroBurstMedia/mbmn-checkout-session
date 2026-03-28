const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
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
- Contact: microburstmediasolutions@outlook.com | +1 (954) 600-8695.
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
        res.status(500).json({ error: "Checkout failed." });
    }
});

// --- 4. CHATBOT ENDPOINT (Safe-Relay Logic) ---
app.post('/chat', async (req, res) => { 
    const { message } = req.body; 
    
    // THE URL MUST BE ON ITS OWN LINE
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzYsW53JScMQ1lpe0Jfax7MzylYVXu0MypvBghtPHMSPEBraYMrpy2X4M0P-NcDkWVn/exec';

    let sheetReply = null;

    // 1. Try the Sheet first
    try {
        const sheetResponse = await axios.post(scriptUrl, { message: message }, { timeout: 4000 });
        sheetReply = sheetResponse.data.reply;
    } catch (sheetError) {
        console.warn("Sheet unreachable or timed out, skipping to Gemini...");
    }

    // 2. If the sheet gave a real answer
    if (sheetReply && !sheetReply.includes("out of my scope of support")) {
        return res.json({ reply: sheetReply });
    }

    // 3. Fallback to Gemini AI
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${systemInstruction}\n\nUser Message: ${message}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (aiError) {
        console.error("AI Error:", aiError.message);
        res.status(500).json({ reply: "The MBM strategist is currently recalibrating. Please try again in a moment." });
    }
});

// --- 5. SERVER START (Crucial Ignition Lines) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MBMN Node Active and Interlinked');
});
