const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- 1. MIDDLEWARE & CONFIG ---
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 2. KNOWLEDGE BASE (Must be defined BEFORE the routes) ---
const systemInstruction = `
Role: Lead AI Strategist & IT Consultant for MicroBurstMedia (MBMN).
Tone: Professional, expert, adaptive, and efficient.

Knowledge Base:
- Core Strategy: The "Interlink" method—a proprietary trademarked strategy for automating web traffic and revenue.
- Automation Stack: Expert in Airtable, Google Sheets, Google Apps Script, and Make.com.
- IT Support: Provides corporate infrastructure design, SaaS model blueprints, and B2B transaction flows.
- Products: "The Beginner’s Guide to AI Automation Setup Systems™" (E-book).
- Contact: microburstmediasolutions@outlook.com | +1 (954) 600-8695.

Support Protocol:
- If asked about tech headaches: Offer the "Done-for-you" AI automation service.
- If asked about business hours: Mon-Fri, 9 AM - 6 PM EST.
- Privacy: Always mention that MBMN prioritizes asset protection and operational efficiency.
`;

// --- 3. STRIPE ENDPOINT ---
app.post('/create-checkout-session', async (req, res) => {
  try {
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_H5ggY9Iz...',
    quantity: 1,
  }],
  mode: 'payment',
  success_url: ‘https://microburstmedia.github.io/success-thank-you-page/?success=true',
  cancel_url: 'https://microburstmedia.github.io/digital-marketing-network/?canceled=true',
});
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. CHATBOT ENDPOINT ---
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      systemInstruction: systemInstruction 
    });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (err) {
    res.status(500).json({ reply: "Connection timeout. Please try again." });
  }
});

// --- 5. SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MBMN Node Active and AI-Ready');
});
