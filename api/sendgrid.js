const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function (req, res) {
  // call sendgrid first, since this request doesn't allow any CORS
  if (req.method === "POST") {
    const msg = {
      to: req.body.email, // Change to your recipient
      from: process.env.SENDGRID_VERIFIED_SENDER, // verified sender
      subject: req.body.subject,
      message: req.body.message,
      html: `<div>
        <h1>You're being contacted by: ${req.body.firstName} ${req.body.lastName}</h1>
        <h5>Their prefered method of contact is: ${req.body["method-of-contact"]} </h5>
        <h5>You can reach them at ${req.body.phone}, </h5>
        <h5>Or through their email ${req.body.email}</h5>
        <p>They've reached out regarding:</p>
        <p>${req.body.message}</p>
      </div>`,
    };

    sendgrid
      .send(msg)
      .then(() => {
        res.status(200).json({
          location: "From within the sendgrid funcion",
          success: true,
          message: "Email sent",
        });
      })
      .catch((error) => {
        console.log("Error on sendEmail Function: ", error);
        console.log("Error body: ", error.response.body);
        res.status(500).json({
          location: "From within the sendgrid funcion",
          success: false,
          message: `Server error: ${error}`,
        });
      });
  }

  // set permission headers for original client call
  res.setHeader("Accept-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
};
