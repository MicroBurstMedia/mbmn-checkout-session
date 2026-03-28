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
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');

app.use(express.json());
app.use(cors());

// --- THE BRIDGE ---
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // YOUR NEW WEB APP URL FROM GOOGLE
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbzYsW53JScMQ1lpe0Jfax7MzylYVXu0MypvBghtPHMSPEBraYMrpy2X4M0P-NcDkWVn/exec';

        console.log("Sending message to Sheets:", message);

        const response = await axios.post(scriptUrl, { message: message }, { timeout: 8000 });
        
        console.log("Sheets responded with:", response.data);
        res.json({ reply: response.data.reply });

    } catch (err) {
        console.error("Connection Error Details:", err.message);
        res.status(500).json({ reply: "The Bridge is down. Check Render Logs." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MBMN Bridge Active on Port ${PORT}`));

// --- 5. SERVER START (Crucial Ignition Lines) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MBMN Node Active and Interlinked');
});
