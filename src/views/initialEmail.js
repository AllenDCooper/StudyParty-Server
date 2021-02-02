const initialEmail = (name, availabilityArr, email, timeZone) => {
  console.log(`email log-availabilityArr: ${availabilityArr}`);

  const styles = {
    button:
      'display: inline-block; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; border-radius: .25rem; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #fff; background-color: #007bff; border-color: #007bff;',
    dayName: 'font-weight: bold',
  };

  const buttonClickLink = `https://studyparty-server.herokuapp.com/api/confirm`;

  let availabilityStr = '';
  availabilityArr.forEach((day, index) => {
    let dayString = `<li><span style="font-weight: bold">${day.dayName}</span>: `;
    let timeSlotStr = '';
    day.dayArr.forEach((timeSlot, index) => {
      timeSlotStr += `<span>`;
      if (index > 0) {
        timeSlotStr += `, `;
      }
      timeSlotStr += `${timeSlot}</span>`;
    });
    dayString += `${timeSlotStr} <span class="timezone"> ${timeZone}<span></li>`;
    availabilityStr += dayString;
  });

  return `
    <div class="text-align: center; margin: 0 auto">
      <div class="aHl">
      </div>
      <div id=":2f5" tabindex="-1">
      </div>
      <div id=":2eu" class="ii gt">
        <div id=":2et" class="a3s aiL ">
          <div dir="ltr">
            <div dir="ltr" style="text-align: center; max-width: 500px; margin: 0 auto">
              <div style="text-align:center">
                <img src='cid:StudyParty_logo_transparent_sm.png' alt="StudyParty_logo_transparent_lg.png" width="181" height="72" style="margin-right:0px" data-image-whitelisted="" class="CToWUd" />
                <br></br>
              </div>
              <div>
                Hi ${name},
              </div>
              <div>
                <br></br>
              </div>
              <div>
                <p>Thanks for signing up! We're working on your request and hope to connect you with a GMAT study partner
                within the next 48 hours. Once connected, you and your partner will have access to a calendar event and Zoom link for your session.
                </p>
                <p>Before we schedule your StudyParty, please first confirm your availability and click the confirm button below:
                </p>
                <div style="margin: 0 auto; text-align: center">
                <ul style="list-style-type:none; padding-left: 0px">
                  ${availabilityStr}
                </ul>
                </div>
                <div style="text-align: center">
                  <form action=${buttonClickLink} method="POST">
                    <input type='hidden' name='email' value='${email}'/>
                    <button style="display: inline-block; margin: 10px auto; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; padding: .375rem .75rem; line-height: 2; border-radius: .25rem; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #fff; background-color: #007bff; border-color: #007bff; width: 200px;">CONFIRM</button>
                  </form>
                </div>
                <p>If you need to update your availability in the interim, please respond to this email and let us know what time slots work (or don't work) with your schedule.</p>
              </div>
              <div>
                <br></br>
              </div>
              <div>
                Cheers,
              </div>
              <div>
                Team StudyParty
              </div>
            </div>
          </div>
          <div class="yj6qo">
          </div>
          <div class="adL">
          </div>
        </div>
      </div>
      <div id=":2f9" class="ii gt" style="display:none">
        <div id=":2fa" class="a3s aiL undefined">
        </div>
      </div>
      <div class="hi">
      </div>
    </div>`;
};

module.exports = initialEmail;
