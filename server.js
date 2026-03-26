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

app.listen(3000, () => console.log('Server running on port 3000'));
