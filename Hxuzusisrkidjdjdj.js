const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const app = express();
const port = 3000;

// Replace with your Twilio credentials
const accountSid = 'your_twilio_account_sid';
const authToken = 'your_twilio_auth_token';
const client = new twilio(accountSid, authToken);

// Replace with your email credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password'
    }
});

app.use(bodyParser.json());

let otpStorage = {};

app.post('/sendOtp', (req, res) => {
    const contact = req.body.contact;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[contact] = otp;

    if (/^\d+$/.test(contact)) {
        // Send OTP via SMS
        client.messages.create({
            body: `Your OTP is ${otp}`,
            to: contact,
            from: 'your_twilio_phone_number'
        }).then(message => res.json({ success: true }))
          .catch(error => res.json({ success: false, error }));
    } else {
        // Send OTP via Email
        const mailOptions = {
            from: 'your_email@gmail.com',
            to: contact,
            subject: 'Your OTP',
            text: `Your OTP is ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.json({ success: false, error });
            } else {
                res.json({ success: true });
            }
        });
    }
});

app.post('/verifyOtp', (req, res) => {
    const contact = req.body.contact;
    const otp = req.body.otp;

    if (otpStorage[contact] === otp) {
        delete otpStorage[contact];
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
