const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

// Gmail Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lagharitahir08@gmail.com',
        // Security Recommendation: Always use process.env for sensitive credentials
        pass: process.env.EMAIL_PASS || 'mcfn tmzh qnxd ghaa' 
    }
});

// Note: In-memory store (users object) will reset on serverless function restarts.
// Consider using a database like MongoDB or Supabase for persistent data storage.
let users = {};

app.post('/api/submit-subscription', (req, res) => {
    const { name, email, plan, price, txid } = req.body;
    const userId = Date.now().toString();

    users[userId] = { name, email, plan, status: 'pending' };

    // Automatically detect Vercel production domain or fallback to host header
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = process.env.VERCEL_URL || req.headers.host;
    const baseUrl = host.startsWith('http') ? host : `${protocol}://${host}`;

    const approveLink = `${baseUrl}/api/approve/${userId}`;

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
        res.json({ success: true, message: 'Submitted successfully' });
    });
});

app.get('/api/approve/:userId', (req, res) => {
    const userId = req.params.userId;
    if (users[userId]) {
        users[userId].status = 'active';
        res.send('<div style="text-align:center; padding: 50px; font-family: sans-serif;"><h1 style="color:green;">Subscription Approved!</h1><p>User portal has been unlocked.</p></div>');
    } else {
        res.send('<h1>Invalid Link or Request Expired!</h1>');
    }
});

// Export Express app for Vercel Serverless Functions
module.exports = app;
