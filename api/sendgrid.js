const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const fetchSendGrid = (req, res) => {
  sendgrid
    .send({
      to: process.env.SENDGRID_VERIFIED_SENDER, // verified sender
      from: req.body.email, // submission sender
      subject: req.body.subject,
      message: req.body.message,
      html: `<div>
        <h1>You're being contacted by: ${req.body.firstName} ${
        req.body.lastName
      }</h1>
        -------------------------------------------------
        <h3>Their prefered method of contact is: ${
          req.body["method-of-contact"]
        } </h3>
        -------------------------------------------------
        <h3>You can reach them at ${req.body.phone}, </h3>
        <h3>Or through their email ${req.body.email}</h3>
        -------------------------------------------------
        <p>They've reached out regarding:</p>
        <p>${req.body.message}</p>
        -------------------------------------------------
        ${req.body.file && <image src={req.body.file} alt='image-attachment' />}
        -------------------------------------------------
        <br/>
        <p>They live in ${req.body.city}</p>
      </div>`,
    })
    .then(() => {
      res
        .status(200)
        .json({
          location: "From within the sendgrid funcion",
          success: true,
          message: "Email sent",
        })
        .end();
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
};

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Accept-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");
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
  return await fn(req, res);
};

module.exports = allowCors(fetchSendGrid);
