require("dotenv").config();
const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  const { fullName, email, message, files } = JSON.parse(event.body);

  const sendToSendGrid = new Promise((resolve, reject) => {
    sendgrid
      .send({
        personalizations: [
          {
            to: [
              {
                email: email,
              },
            ],
            bcc: [
              {
                email: process.env.SENDGRID_VERIFIED_SENDER,
              },
            ],
          },
        ],
        from: {
          name: "Build Beautiful Spaces",
          email: process.env.SENDGRID_VERIFIED_SENDER,
        },
        subject: "BBS - Thanks for reaching out!",
        templateId: process.env.TEMPLATE_ID_HOME_PAGE,
        dynamic_template_data: {
          subject: "Project Inquiry",
          fullName: fullName,
          email: email,
          message: message,
          files: files,
        },
      })
      .then((res) => {
        console.log("Successful Result: ", res);
        resolve(
          JSON.stringify({
            statusCode: 202,
            response: res,
            message: "Your inquiry was successfully sent!",
          })
        );
      })
      .catch((error) => {
        console.log("Error in homeFormSubmission: ", error);
        reject(
          JSON.stringify({
            statusCode: 500,
            success: false,
            error: error,
            message: "There was a problem with your request",
          })
        );
      });
  });

  return sendToSendGrid;
};
