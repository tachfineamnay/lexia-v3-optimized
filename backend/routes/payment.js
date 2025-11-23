const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/user');
const { offer } = require('../config/offer');

// Mock Stripe for now
const stripe = {
    checkout: {
        sessions: {
            create: async (params) => ({
                id: 'sess_mock_' + Date.now(),
                url: 'http://localhost:5173/payment/success?session_id=sess_mock_' + Date.now() // Redirect to frontend success
            })
        }
    }
};

/**
 * @route   POST /api/payment/create-session
 * @desc    Create a payment session
 * @access  Private
 */
router.post('/create-session', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.hasPaid) {
            return res.status(400).json({ message: 'User has already paid' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: offer.currency,
                    product_data: {
                        name: offer.name,
                        description: offer.description,
                    },
                    unit_amount: offer.price,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
            customer_email: user.email,
            metadata: {
                userId: user._id.toString()
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
        console.error('Payment session error:', err);
        res.status(500).json({ message: 'Error creating payment session' });
    }
});

/**
 * @route   POST /api/payment/mock-success
 * @desc    Mock payment success (DEV ONLY)
 * @access  Private
 */
router.post('/mock-success', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.hasPaid = true;
        user.paymentDate = new Date();
        user.stripeSessionId = 'sess_mock_' + Date.now();
        await user.save();

        res.json({ success: true, message: 'Payment mocked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
