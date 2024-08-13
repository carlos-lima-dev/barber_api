// src/services/smsService.ts
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendAppointmentReminder = async (
  phone: string,
  appointmentDetails: {name: string; date: Date; time: string; location: string}
) => {
  const formattedPhone = phone.startsWith("+") ? phone : `+351${phone}`;

  const message = `Olá ${
    appointmentDetails.name
  }, lembrete do seu agendamento para amanhã:
TIO BARBAS!  
Data: ${appointmentDetails.date.toLocaleDateString()}
Hora: ${appointmentDetails.time}
Local: ${appointmentDetails.location}
Caso não possa comparecer p.f. contacte-nos.
Obrigado!
Tel.+351912050222`;

  try {
    console.log(`Sending SMS to ${formattedPhone}`);
    const messageResponse = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
  } catch (error) {
    console.error("Error sending appointment reminder SMS:", error);
    // Check if the error has a response from Twilio
    if (error) {
      console.error(`Twilio error code: ${error}, message: ${error}`);
    }
  }
};
