const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'AI Automation Setup Systems E-Book' },
        unit_amount: 9700, // $97.00 in cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    // These redirect the user back to your GitHub site after payment
    success_url: 'https://microburstmedia.github.io/success-thank-you-page',
    cancel_url: 'https://microburstmedia.github.io/digital-marketing-network/',
  });

  res.json({ id: session.id });
});

// --- CHATBOT ENDPOINT ---

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbyA6OpUvs_Dqx5mnTH2HMmTWwz6-VM_KkdTFmQEI64DsKnvYAFpch0424Ye-u1iLIOWXA/exec';

        // 1. CALL THE "OPERATOR" (Google Sheets) FIRST
        const sheetResponse = await axios.post(scriptUrl, { message: message });
        const sheetReply = sheetResponse.data.reply;

        // 2. CHECK IF THE SHEET GAVE A DEFAULT/ERROR RESPONSE
        // (Make sure this matches the "defaultResponse" in your Apps Script)
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
        res.status(500).json({ reply: "Systems are currently recalibrating. Please try again." });
    }
});
