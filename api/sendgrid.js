import sendgrid from "@sendgrid/mail";
import micro from "micro-cors";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(req, res) {
  try {
    console.log("REQ.BODY", req.body);
    await sendgrid.send({
      to: "daniel@bldrscove.com", // Change to your recipient
      from: "edwin@buildbeautifulspaces.com", // Change to your verified sender
      subject: `${req.body.subject} Sending with SendGrid is Fun`,
      text: "and easy to do anywhere, even with Node.js",
      html: `<div><strong>and easy to do anywhere</strong>, even with Node.js</div>`,
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json({ Response: req.body });
}

const cors = micro();

module.exports = cors(sendEmail);
