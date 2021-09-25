import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: "daniel@bldrscove.com", // Change to your recipient
  from: "edwin@buildbeautifulspaces.com", // Change to your verified sender
  subject: "Sending with SendGrid is Fun",
  text: "and easy to do anywhere, even with Node.js",
  html: `<div><strong>and easy to do anywhere</strong>, even with Node.js</div>`,
};

//ES8
(async () => {
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
})();
