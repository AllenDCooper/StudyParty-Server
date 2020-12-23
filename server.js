const express = require('express');
const cors = require('cors');

const app = express();
const nodemailer = require('nodemailer');
// const routes = require("./routes");
const PORT = process.env.PORT || 3001;
require('dotenv').config();
const path = require('path');
const initialEmail = require('./views/initialEmail.js');
const { sendUserToDb } = require('./db');
const { sendConfirmToGoogle, sendToGoogleSheets } = require('./google');
const { formatAvailabilityArr } = require('./time');

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

// nodemailer
async function sendInitEmail(email, name, timeZone, rawAvailArr,timeZoneLoc response) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAILUSER,
      pass: process.env.EMAILPASSWORD,
    },
  });
  const availabilityArr = formatAvailabilityArr(
    rawAvailArr,
    timeZoneLoc
  );
  // send mail with defined transport object
  const info = await transporter.sendMail(
    {
      from: '"StudyParty" <info@mystudyparty.com>', // sender address
      to: email, // list of receivers
      subject: 'Welcome to StudyParty!', // Subject line
      text:
        "Thanks for signing up! We're working on your request and hope to connect you with a GMAT study partner within the next 48 hours. If you need to update your availability in the interim, please respond to this email and let us know what time slots work (or don't work) with your schedule. Cheers, Team StudyParty ", // plain text body
      attachments: [
        {
          filename: 'StudyParty_logo_transparent_sm.png',
          path: `${__dirname}/images/StudyParty_logo_transparent_sm.png`,
          cid: 'StudyParty_logo_transparent_sm.png',
        },
      ],
      html: initialEmail(name, availabilityArr, email, timeZone), // html body
    },
    error => {
      if (error) {
        console.log(error);
        return response.status(500).json({ error });
      }
      return response.json({ message: 'email sent' });
    }
  );
} // routes
app.get('/images/StudyParty_logo_transparent_sm.png', (req, res) => {
  res.sendFile(
    path.join(`${__dirname}/images/StudyParty_logo_transparent_sm.png`)
  );
});

// API routes
app.get('/api/signup', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/signup', (req, res) => {
  sendUserToDb(req.body);
  sendToGoogleSheets(req.body);
  // sendInitEmail(
  // req.body.email,
  // req.body.name,
  // req.body.timeZone,
  // req.body.availabilityArr,
  // req.body.timeZoneLocation,
  // res);
});

app.post('/api/confirm', (req, res, next) => {
  console.log(req.query.email);
  // console.log(req.body.email);
  console.log('confirm api hit');
  // sendEmail(req.body.email, req.body.name)
  sendConfirmToGoogle(req.query.email, res);
});

// Start the API server
app.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
