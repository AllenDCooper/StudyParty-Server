const express = require("express");
var cors = require('cors');
const app = express();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
// const routes = require("./routes");
const PORT = process.env.PORT || 3001;
const initialEmail = require('./initialEmail.js')
const initialEmail2 = require('./initialEmail2.js')
require("dotenv").config();

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// Add routes, both API and view
// app.use(routes);

// nodemailer
// function sendEmail(email, name) {
// async..await is not allowed in global scope, must use a wrapper
async function main(email, name, response) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

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
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

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

sendConfirmToGoogle = (email) => {
  const url = 'https://script.google.com/macros/s/AKfycbwLo3NjXMqXtdoJlqTVBpvE9xd8u9u5QQUF2nkR-cJtjbCwtoCGkfy2/exec'
  axios.get(url, {
    params: {
      email: email,
      confirm: true
    }
  })
    .then(function (response) {
      setResponseRecieved(true);
      console.log("confirmation submitted");
      console.log(response)
    })
    .catch(function (error) {
      setSubmitError(true);
      console.log(error)
    })
}

// API calls
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
  // console.log(req);
  console.log(req.body.email);
  console.log("confirmTest api hit")
  // sendEmail(req.body.email, req.body.name)
  sendConfirmToGoogle(email);
});

// Start the API server
app.listen(PORT, function () {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
