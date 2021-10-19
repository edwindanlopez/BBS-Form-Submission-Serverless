require("dotenv").config();
const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  let headers = {
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin",
    "Content-Type": "application/json", //optional
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "8640",
  };

  headers["Access-Control-Allow-Origin"] = "*";
  headers["Vary"] = "Origin";

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

  try {
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 204,
        headers,
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
    return {
      statusCode: 401,
      headers,
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: e.toString(),
    };
  }
};
