// routes/membershipRoute.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Membership = require('../models/member');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/membership', async (req, res) => {
  try {
    const { name, email, phone, course, experience } = req.body;

    const newApplication = new Membership({ name, email, phone, course, experience });
    await newApplication.save();


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Membership Application',
      html: `
        <h3>New Membership Application</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Experience:</strong> ${experience}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

module.exports = router;
