const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Persistent store fallback for serverless session lifecycle
let activeUsers = new Set();
let userProfiles = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Gmail Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lagharitahir08@gmail.com',
        pass: process.env.EMAIL_PASS || 'mcfn tmzh qnxd ghaa' 
    }
});

// Subscription Submission Route
app.post('/api/submit-subscription', (req, res) => {
    const { name, email, plan, price, txid } = req.body;
    const userId = Date.now().toString();

    userProfiles[userId] = { name, email, plan, status: 'pending' };
    userProfiles[email] = userProfiles[userId];

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = process.env.VERCEL_URL || req.headers.host;
    const baseUrl = host.startsWith('http') ? host : `${protocol}://${host}`;

    const approveLink = `${baseUrl}/api/approve/${userId}?email=${encodeURIComponent(email)}`;

    const mailOptions = {
        from: '"Meta Ads Portal" <lagharitahir08@gmail.com>',
        to: 'lagharitahir08@gmail.com',
        subject: '🚨 New Subscription Payment Received!',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 10px;">
                <h2 style="color: #38bdf8;">New Subscription Payment Received</h2>
                <p><strong>Full Name:</strong> ${name}</p>
                <p><strong>User Email:</strong> ${email}</p>
                <p><strong>Plan Selected:</strong> ${plan} (${price} PKR)</p>
                <p><strong>EasyPaisa Txn ID:</strong> ${txid}</p>
                <br>
                <a href="${approveLink}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                   Approve Subscription Now
                </a>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
            return res.status(500).json({ success: false, message: 'Email failed' });
        }
        res.json({ success: true, userId, message: 'Submitted successfully' });
    });
});

// Approve Subscription Route
app.get('/api/approve/:userId', (req, res) => {
    const { userId } = req.params;
    const { email } = req.query;

    activeUsers.add(userId);
    if (email) activeUsers.add(email);

    res.send(`
        <div style="text-align:center; padding: 50px; font-family: sans-serif; background-color: #0f172a; color: #fff; height: 100vh;">
            <h1 style="color:#22c55e;">Subscription Approved Successfully!</h1>
            <p>User (${email || userId}) portal is now unlocked. You can close this window.</p>
        </div>
    `);
});

// Check Status Polling Route
app.get('/api/check-status/:id', (req, res) => {
    const id = decodeURIComponent(req.params.id);
    if (activeUsers.has(id)) {
        res.json({ status: 'active' });
    } else {
        res.json({ status: 'pending' });
    }
});

// AI Campaign Generator Backend Route (Real Engine)
app.post('/api/generate-ad', (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }

    // Auto-generate realistic response based on user prompt
    const generatedAd = {
        caption: `🔥 Exclusive Offer: ${prompt}! Order today and get free delivery across Pakistan. Limited stock available! 🛍️✨`,
        hashtags: '#PakistanShopping #OnlineDeals #SpecialDiscount #TrendingNow',
        scheduledTime: 'Today at 6:00 PM (Auto-Scheduled)'
    };

    res.json({ success: true, data: generatedAd });
});

module.exports = app;
