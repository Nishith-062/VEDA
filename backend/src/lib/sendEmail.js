import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify/${token}`;
console.log(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: "nishith.cbit@gmail.com", // verified sender in SendGrid
    subject: "Verify your VEDA account",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #4f46e5; color: #ffffff; text-align: center; padding: 30px;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to VEDA 🎓</h1>
          </div>
          <div style="padding: 30px; color: #333333;">
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">Thank you for signing up! Please verify your email to activate your VEDA account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p style="font-size: 14px; color: #555555;">This verification link will expire in 15 minutes.</p>
            <p style="font-size: 14px; color: #555555;">If you did not sign up, please ignore this email.</p>
          </div>
          <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 12px; color: #777777;">
            © ${new Date().getFullYear()} VEDA. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
