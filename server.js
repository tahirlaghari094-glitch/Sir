const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lagharitahir08@gmail.com',
        pass: 'mcfn tmzh qnxd ghaa'
    }
});

let users = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/submit-subscription', (req, res) => {
    const { name, email, plan, price, txid } = req.body;
    const userId = Date.now().toString();

    users[userId] = { name, email, plan, status: 'pending' };

    const approveLink = `http://localhost:3000/api/approve/${userId}`;

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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));