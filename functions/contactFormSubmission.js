require("dotenv").config();
const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event, context) => {
  const sendToSendGrid = new Promise((resolve, reject) => {
    // parse incoming req data
    const {
      firstName,
      lastName,
      email,
      city,
      message,
      contactMethod,
      phone,
      subject,
      file,
    } = JSON.parse(event.body);

    console.log("File size: ", file.size);

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
                email: `${process.env.SENDGRID_VERIFIED_SENDER}`,
              },
            ],
          },
        ],
        from: {
          name: "Build Beautiful Spaces",
          email: `${process.env.SENDGRID_VERIFIED_SENDER}`,
        },
        subject: "BBS - Successfully received your message!",
        templateId: `${process.env.TEMPLATE_ID_CONTACT_PAGE}`,
        dynamic_template_data: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          city: city,
          message: message,
          methodOfContact: contactMethod,
          phone: phone,
          subject: subject,
          attachment: (() => {
            if (file.base64Url) {
              return {
                content: file.base64Url,
                filename: file.filename,
                size: file.size,
                type: file.type,
              };
            }
          })(),
        },
        attachments: (() => {
          if (file.base64Url) {
            return [
              {
                content: file.base64Url,
                filename: file.filename,
                type: file.type,
                disposition: "attachment",
                content_id: "form-attachement",
              },
            ];
          }
        })(),
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
      statusCode: 204,
      headers: CORS_HEADERS,
    };
  } else if (event.httpMethod === "POST") {
    return sendToSendGrid
      .then((res) => {
        return {
          statusCode: res[0].statusCode,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
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
    statusCode: 500,
    body: JSON.stringify("Only accepting POST requests"),
  };
};
