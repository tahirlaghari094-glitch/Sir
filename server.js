const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lagharitahir08@gmail.com',
        pass: process.env.EMAIL_PASS || 'mcfn tmzh qnxd ghaa' 
    }
});

// In-memory store (Fallback)
let activeUsers = new Set();

app.post('/api/submit-subscription', (req, res) => {
    const { name, email, plan, price, txid } = req.body;
    const userId = Date.now().toString();

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = process.env.VERCEL_URL || req.headers.host;
    const baseUrl = host.startsWith('http') ? host : `${protocol}://${host}`;

    // Direct approve link with email param
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

// Approve Endpoint
app.get('/api/approve/:userId', (req, res) => {
    const { userId } = req.params;
    const { email } = req.query;

    activeUsers.add(userId);
    if(email) activeUsers.add(email);

    res.send(`
        <div style="text-align:center; padding: 50px; font-family: sans-serif;">
            <h1 style="color:green;">Subscription Approved!</h1>
            <p>User account (${email || userId}) has been unlocked successfully.</p>
        </div>
    `);
});

// Status check API for frontend polling
app.get('/api/check-status/:id', (req, res) => {
    const { id } = req.params;
    if (activeUsers.has(id)) {
        res.json({ status: 'active' });
    } else {
        res.json({ status: 'pending' });
    }
});

module.exports = app;
