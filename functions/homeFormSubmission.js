require("dotenv").config();
const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  const headers = {
    "Accept-Control-Allow-Origin": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

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
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight call." }),
    };
  } else if (event.httpMethod === "POST") {
    return sendToSendGrid
      .then((res) => {
        return {
          statusCode: res[0].statusCode,
          body: JSON.stringify({
            success: true,
            message: "Email sent",
          }),
        };
      })
      .catch((error) => {
        return {
          statusCode: error.code,
          body: JSON.stringify({
            success: false,
            error: error.message,
            message: error.response.body.errors[0].message,
          }),
        };
      });
  }
};
