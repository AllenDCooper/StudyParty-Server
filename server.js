const express = require('express');
const cors = require('cors');

const app = express();
const nodemailer = require('nodemailer');
const { DateTime } = require('luxon');
// const routes = require("./routes");
const PORT = process.env.PORT || 3001;
require('dotenv').config();
const axios = require('axios');
const path = require('path');
const initialEmail = require('./views/initialEmail.js');
const { appendDB } = require('./db');

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

const formatAvailabilityArr = (availabilityArr, timeZoneLocation) => {
  // [{dayName: 1, dayArr: []}, {dayName: 2, dayArr:[]} ]
  console.log(timeZoneLocation);
  const formattedAvailabilityArr = [];
  let currentDayNum = 0;
  let dayIndex = -1;
  availabilityArr.forEach((timeSlot, index) => {
    const newTime = DateTime.fromMillis(parseInt(timeSlot), {
      zone: timeZoneLocation,
    });
    console.log(`newTime: ${newTime}`);
    console.log(`newTime.day: ${newTime.day}`);
    console.log(`currentDayNum: ${currentDayNum}`);
    if (newTime.day > currentDayNum) {
      currentDayNum = newTime.day;
      dayIndex++;
      const currentDay = newTime.toFormat('ccc LLL d y');
      const newTimeSlot = newTime.toFormat('T');
      const newDayObj = { dayName: currentDay, dayArr: [newTimeSlot] };
      formattedAvailabilityArr.push(newDayObj);
    } else {
      const newTimeSlot = newTime.toFormat('T');
      console.log(formattedAvailabilityArr);
      console.log(`dayIndex: ${dayIndex}`);
      console.log(formattedAvailabilityArr[dayIndex]);
      formattedAvailabilityArr[dayIndex].dayArr.push(newTimeSlot);
    }
  });
  return formattedAvailabilityArr;
};

// nodemailer
async function main(email, name, availabilityArr, timeZone, response) {
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
}

const sendConfirmToGoogle = (email, res) => {
  const url =
    'https://script.google.com/macros/s/AKfycbwLo3NjXMqXtdoJlqTVBpvE9xd8u9u5QQUF2nkR-cJtjbCwtoCGkfy2/exec';
  axios
    .get(url, {
      params: {
        email,
        confirm: true,
      },
    })
    .then(function(response) {
      console.log('confirmation submitted');
      res
        .status(200)
        .sendFile(path.join(`${__dirname}/views/confirmation.html`));
    })
    .catch(function(error) {
      console.log(error);
      res
        .status(500)
        .send(path.join(`${__dirname}/views/confirmationError.html`));
    });
};

// routes
app.get('/images/StudyParty_logo_transparent_sm.png', (req, res) => {
  res.sendFile(
    path.join(`${__dirname}/images/StudyParty_logo_transparent_sm.png`)
  );
});

// API routes
app.get('/api/signup', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/signup', (req, res, next) => {
  console.log(req.body);
  console.log(req.body.email);
  console.log(req.body.availabilityArr);
  console.log(req.body.timeZone);
  console.log(req.body.timeZoneLocation);
  console.log(req.body.timeZoneOffset);
  // sendEmail(req.body.email, req.body.name)

  appendDB({ table: 'users', item: req.body });

  const formattedAvailabilityArr = formatAvailabilityArr(
    req.body.availabilityArr,
    req.body.timeZoneLocation
  );
  main(
    req.body.email,
    req.body.name,
    formattedAvailabilityArr,
    req.body.timeZone,
    res
  );
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
