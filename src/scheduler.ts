// src/scheduler.ts
import cron from "node-cron";
import {
  removeOldAppointments,
  getByDate,
} from "./services/appointmentsService.js";
import {sendAppointmentReminder} from "./services/smsService.js";

const scheduleDailyCleanup = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily cleanup job at", new Date());
    try {
      const deletedCount = await removeOldAppointments();
      console.log(`${deletedCount} old appointments removed successfully`);
    } catch (error) {
      console.error("Error removing old appointments:", error);
    }
  });

  cron.schedule("25 14 * * *", async () => {
    console.log("Running daily reminder job at", new Date());
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split("T")[0];
      const appointments = await getByDate(dateString);

      console.log(
        `Retrieved ${appointments.length} appointments for ${dateString}`
      );

      for (const appointment of appointments) {
        const appointmentDate = new Date(appointment.date);
        console.log(
          `Sending reminder for appointment: ${JSON.stringify(
            appointment.customerName
          )}`
        );
        await sendAppointmentReminder(appointment.phone, {
          name: appointment.customerName || "Cliente",
          date: appointmentDate,
          time: appointment.time,
          location: "rua do camelo, n2 4780-456 Guimaraes.", // Atualize com a localização real, se disponível
        });
      }
    } catch (error) {
      console.error("Error sending reminders:", error);
    }
  });
};

export const runImmediateCleanup = async () => {
  console.log("Running immediate cleanup job at", new Date());
  try {
    const deletedCount = await removeOldAppointments();
    console.log(`${deletedCount} old appointments removed successfully`);
  } catch (error) {
    console.error("Error removing old appointments:", error);
  }
};

export default scheduleDailyCleanup;
