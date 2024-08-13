// src/services/emailService.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendAppointmentConfirmation = async (
  email: string,
  appointmentDetails: {
    name: string;
    date: string;
    time: string;
    location: string;
  }
) => {
  // Combine date and time into a single Date object for formatting
  const appointmentDateTime = new Date(
    `${appointmentDetails.date}T${appointmentDetails.time}`
  );

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Appointment Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2 style="color: #4CAF50;">Appointment Confirmation</h2>
        <p>Dear ${appointmentDetails.name},</p>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Date</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${appointmentDateTime.toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Time</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${appointmentDateTime.toLocaleTimeString(
              [],
              {hour: "2-digit", minute: "2-digit"}
            )}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">Location</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              appointmentDetails.location
            }</td>
          </tr>
        </table>
        <p>If you have any questions or need to reschedule, please contact us at ${
          process.env.GMAIL_USER
        }.</p>
        <p>Thank you for choosing our service!</p>
        <p>Best regards,<br/>Your Company Name</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Appointment confirmation email sent to", email);
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error);
  }
};
