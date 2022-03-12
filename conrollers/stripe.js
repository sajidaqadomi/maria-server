import Stripe from 'stripe';
const stripe = Stripe("sk_test_51I31KDAF6Ab7L2L1mRmhqlPFZx9DAQGYOvfNzLghbNXVuODTFGmQKaWTmy3FwEDrAeQBkNusUCJrtoLu6WCdJhc100t20UsOO6")

export const payment_post = async (req, res) => {
    try {
        const charge = await stripe.charges.create({
            source: req.body.tokenId,
            amount: req.body.amount,
            currency: "usd"
        })

        if (!charge) return res.status(400).json({ error: 'charge unsuccessful' })
        return res.status(201).json(charge)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};