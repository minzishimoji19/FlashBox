const express = require('express');
const dotenv = require('dotenv');
const bot = require('./bot');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Webhook endpoint
app.post('/webhook', async (req, res) => {
    try {
        await bot.handleWebhook(req.body);
        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});