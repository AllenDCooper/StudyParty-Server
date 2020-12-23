const axios = require('axios');
const path = require('path');
const { formatDateArr, getTimeZone } = require('./time');

// Sends data to populate Google Sheet
const sendToGoogleSheets = data => {
  // console.log(valueArr)
  // props.setShow(props.show + 1);
  // const [testDate, groupSize, testPrep, targetScore, targetSection, availability, nameAndEmail] = valueArr

  const url = process.env.GOOGLE_SHEETS;
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: {
          submitted: getTimeZone('currentMoment'),
          email: data.email,
          name: data.name,
          testDateMonth: data.testDate.getMonth() + 1,
          testDateYear: data.testDate.getFullYear(),
          availabilityEST: JSON.stringify(
            formatDateArr(data.availability, 'newYork')
          ),
          availabilityLocal: JSON.stringify(
            formatDateArr(data.availability, 'local')
          ),
          availabilityTime: JSON.stringify(
            formatDateArr(data.availability, 'time')
          ),
          testPrep: data.testPrep,
          groupSize: data.studyGroup,
          targetScore: data.targetScore,
          targetSection: data.targetSection,
          timeZone: getTimeZone('timeZoneName'),
          timeZoneLocation: getTimeZone('timeZoneLocation'),
          timeZoneOffset: getTimeZone('timeZoneOffset'),
        },
      })
      .then(function(response) {
        resolve(response);
      })
      .catch(function(error) {
        console.log(error);
        reject(error);
      });
  });
};

const sendConfirmToGoogle = (email, res) => {
  const url = process.env.GOOGLE_EMAIL_URL;
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

module.exports = { sendToGoogleSheets, sendConfirmToGoogle };
