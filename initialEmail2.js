const initialEmail2 = (name, availabilityArr, email) => {
  console.log(availabilityArr)
  let availabilityStr = ""
  availabilityArr.forEach((time, index) => {
    let newDate = new Date(time.timeClicked.start)
    let formattedDate = newDate.toUTCString()
    availabilityStr += `<li>${formattedDate} EST</li>`
  })

  const buttonClickLink = `http://localhost:3001/api/confirmTest?email=${email}`
  return (`
    <div class="">
      <div class="aHl"></div>
      <div id=":2f5" tabindex="-1"></div>
      <div id=":2eu" class="ii gt">
        <div id=":2et" class="a3s aiL ">
          <div dir="ltr">
            <div dir="ltr">
              <div style="text-align:center">
                <img src='cid:StudyParty_logo_transparent_sm.png' alt="StudyParty_logo_transparent_lg.png" width="181" height="72" style="margin-right:0px"
                  data-image-whitelisted="" class="CToWUd" />
                <br></br>
              </div>
              <div>
                Hi ${name},</div>
              <div>
                <br></br>
              </div>
              <div>
                Thanks for signing up! We're working on your request and hope to connect you with a GMAT study partner
                within the next 48 hours. This is the time you indicated for your availabiity:
                <ul>
                ${availabilityStr}
                </ul>
                Please confirm your availability by clicking here:
                <div>
                <a href=${buttonClickLink}><button>Confirm</button></a>
                </div>
                If you need to update your availability in the interim, please respond
            to this email and let us know what time slots work (or don't work) with your schedule. </div>
              <div>
                <br></br>
              </div>
              <div>
                Cheers,</div>
              <div>
                Team StudyParty</div>
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
    </div>`
  )
}

module.exports = initialEmail2;