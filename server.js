const express = require("express");
var cors = require('cors');
const app = express();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
// const routes = require("./routes");
const PORT = process.env.PORT || 3001;
const initialEmail = require('./views/initialEmail.js')
const initialEmail2 = require('./views/initialEmail2.js')
require("dotenv").config();
const axios = require('axios');
const path = require('path');

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// nodemailer
async function main(email, name, response) {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAILUSER,
      pass: process.env.EMAILPASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"StudyParty" <info@mystudyparty.com>', // sender address
    to: email, // list of receivers
    subject: "Welcome to StudyParty!", // Subject line
    text: "Thanks for signing up! We're working on your request and hope to connect you with a GMAT study partner within the next 48 hours. If you need to update your availability in the interim, please respond to this email and let us know what time slots work (or don't work) with your schedule. Cheers, Team StudyParty ", // plain text body
    attachments: [{
      filename: 'StudyParty_logo_transparent_sm.png',
      path: __dirname + '/images/StudyParty_logo_transparent_sm.png',
      cid: 'StudyParty_logo_transparent_sm.png'
    }],
    html: initialEmail(name), // html body
  },
    (error, info) => {
      if (error) {
        return response.status(500).json({ error: 'message' })
      }
      return response.json({ message: 'email sent' })
    }
  );
}

async function testMain(email, name, availabilityArr, response) {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAILUSER2,
      pass: process.env.EMAILPASSWORD2,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"StudyParty Test" <allendcooper@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Welcome to StudyParty!", // Subject line
    text: "Thanks for signing up! We're working on your request and hope to connect you with a GMAT study partner within the next 48 hours. If you need to update your availability in the interim, please respond to this email and let us know what time slots work (or don't work) with your schedule. Cheers, Team StudyParty ", // plain text body
    attachments: [{
      filename: 'StudyParty_logo_transparent_sm.png',
      path: __dirname + '/images/StudyParty_logo_transparent_sm.png',
      cid: 'StudyParty_logo_transparent_sm.png'
    }],
    html: initialEmail2(name, availabilityArr, email), // html body
  },
    (error, info) => {
      if (error) {
        console.log(error)
        return response.status(500).json({ error: error })
      }
      return response.json({ message: 'email sent' })
    }
  );
}

sendConfirmToGoogle = (email, res) => {
  const url = 'https://script.google.com/macros/s/AKfycbwLo3NjXMqXtdoJlqTVBpvE9xd8u9u5QQUF2nkR-cJtjbCwtoCGkfy2/exec'
  axios.get(url, {
    params: {
      email: email,
      confirm: true
    }
  })
    .then(function (response) {
      console.log("confirmation submitted");
      res.status(200).sendFile(path.join(__dirname + '/views/confirmation.html'));
    })
    .catch(function (error) {
      console.log(error)
      res.status(500).send(path.join(__dirname + '/views/confirmationError.html'))
    })
}

// routes
app.get('/images/StudyParty_logo_transparent_sm.png', (req, res) => {
  res.sendFile(path.join(__dirname + '/images/StudyParty_logo_transparent_sm.png'));
});

// API routes
app.get('/api/signup', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/signup', (req, res, next) => {
  // console.log(req);
  console.log(req.body.email);
  // sendEmail(req.body.email, req.body.name)
  main(req.body.email, req.body.name, res)
});

app.post('/api/signupTest', (req, res, next) => {
  // console.log(req);
  console.log(req.body.email);
  console.log(req.body.availabilityArr)
  // sendEmail(req.body.email, req.body.name)
  testMain(req.body.email, req.body.name, req.body.availabilityArr, res)
});

app.post('/api/confirmTest', (req, res, next) => {
  console.log(req.query.email);
  // console.log(req.body.email);
  console.log("confirmTest api hit")
  // sendEmail(req.body.email, req.body.name)
  sendConfirmToGoogle(req.query.email, res);
});

// Start the API server
app.listen(PORT, function () {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
