// src/services/appointmentsService.ts
import Appointment from "../models/Appointment.js";
import {IAppointment} from "../interfaces/interfaces.js";

export const getAllAppointments = async (): Promise<IAppointment[]> => {
  return await Appointment.find();
};

export const addAppointment = async (
  appointmentData: IAppointment
): Promise<IAppointment> => {
  const appointment = new Appointment(appointmentData);
  return await appointment.save();
};

export const modifyAppointment = async (
  id: string,
  appointmentData: Partial<IAppointment>
): Promise<IAppointment | null> => {
  return await Appointment.findByIdAndUpdate(id, appointmentData, {new: true});
};

export const removeAppointment = async (
  id: string
): Promise<IAppointment | null> => {
  return await Appointment.findByIdAndDelete(id);
};

export const getByDate = async (date: string): Promise<IAppointment[]> => {
  // Parse the date string to a Date object for proper comparison
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(startDate.getDate() + 1); // Set end date to the next day

  return Appointment.find({
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  }).exec();
};

export const removeOldAppointments = async (): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date part

  const result = await Appointment.deleteMany({
    date: {$lt: today},
  });
  return result.deletedCount || 0;
};
