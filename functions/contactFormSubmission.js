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

  // console.log("Logging parsed body: ", JSON.parse(event.body));
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
        subject: "BBS - Successfully received your message!",
        templateId: process.env.TEMPLATE_ID_CONTACT_PAGE,
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
            file
              ? {
                  content: file.base64Url,
                  filename: file.filename,
                  size: file.size,
                  type: file.type,
                }
              : "";
          })(),
        },
        attachments: (() => {
          file
            ? [
                {
                  content: file.base64Url,
                  filename: file.filename,
                  type: file.type,
                  disposition: "attachment",
                  content_id: "form-attachement",
                },
              ]
            : "";
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

// const allowCors = (fn) => async (req, res) => {
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   res.setHeader("Accept-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   // another common pattern
//   // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//   res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST");
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
//   );
//   if (req.method === "OPTIONS") {
//     res.status(200).end();
//     return;
//   }
//   return await fn(req, res);
// };
