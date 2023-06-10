const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const serviceid = process.env.SSID;
const client = require('twilio')(accountSid, authToken);

function sendotp(phone) {
  client.verify.v2
    .services(serviceid)
    .verifications
    .create({ to: `+91${phone}`, channel: 'sms' })
    .then((verification) => console.log(verification.status));
}

function verifyotp(mobail, otp) {
  return new Promise((resolve) => {
    client.verify.v2
      .services(serviceid)
      .verificationChecks.create({ to: `+91${mobail}`, code: otp })
      .then((verificationcheck) => {
        resolve(verificationcheck);
      });
  });
}

module.exports = {
  sendotp,
  verifyotp,
};
