const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendOtpToEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Xambridge" <${process.env.EMAIL}>`,
    to,
    subject: "Xambridge Password Reset OTP",
    text: `Your OTP for resetting password is: ${otp}`,
    html: `<p>Your OTP for resetting your password is: <b>${otp}</b></p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("OTP Email sent: %s", info.messageId);
};

module.exports = sendOtpToEmail;
