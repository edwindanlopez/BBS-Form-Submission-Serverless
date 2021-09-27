const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function (req, res) {
  if (req.method === "POST") {
    const msg = {
      to: "daniel@bldrscove.com", // Change to your recipient
      from: "edwin@buildbeautifulspaces.com", // Change to your verified sender
      subject: "Try 6",
      text: "This version deployed",
      html: `<div><strong>Sending with</strong>the original function set up.</div>`,
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
  // set permission headers for client
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
