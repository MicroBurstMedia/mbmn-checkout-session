{\rtf1\ansi\ansicpg1252\cocoartf2639
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require('express');\
const app = express();\
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);\
const cors = require('cors');\
\
app.use(express.json());\
app.use(cors());\
\
app.post('/create-checkout-session', async (req, res) => \{\
  const session = await stripe.checkout.sessions.create(\{\
    payment_method_types: ['card'],\
    line_items: [\{\
      price_data: \{\
        currency: 'usd',\
        product_data: \{ name: 'AI Automation Setup Systems E-Book' \},\
        unit_amount: 9700, // $97.00 in cents\
      \},\
      quantity: 1,\
    \}],\
    mode: 'payment',\
    // These redirect the user back to your GitHub site after payment\
    success_url: 'https://microburstmedia.github.io/digital-marketing-network/success',\
    cancel_url: 'https://microburstmedia.github.io/digital-marketing-network/',\
  \});\
\
  res.json(\{ id: session.id \});\
\});\
\
app.listen(3000, () => console.log('Server running on port 3000'));}