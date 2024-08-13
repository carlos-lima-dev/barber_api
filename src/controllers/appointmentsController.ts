// src/controllers/appointmentsController.ts
import {Request, Response} from "express";
import {validationResult} from "express-validator";
import {
  getAllAppointments,
  addAppointment,
  modifyAppointment,
  removeAppointment,
  getByDate,
} from "../services/appointmentsService.js";
import {IAppointment} from "../interfaces/interfaces.js";
import {sendAppointmentConfirmation} from "../services/emailService.js";

export const getAppointments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointments = await getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error getting appointments:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};
export const createAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({errors: errors.array()});
    return;
  }

  try {
    const appointmentData: IAppointment = req.body;
    const appointment = await addAppointment(appointmentData);

    // Send confirmation email after appointment is created
    await sendAppointmentConfirmation(appointmentData.email, {
      name: appointmentData.customerName,
      date: appointmentData.date,
      time: appointmentData.time,
      location: "rua do camelo n1 4898-637 Guimaraes", // Update with actual location if available
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const updateAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({errors: errors.array()});
    return;
  }

  try {
    const appointmentData: Partial<IAppointment> = req.body;
    const updatedAppointment = await modifyAppointment(
      req.params.id,
      appointmentData
    );
    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const deleteAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await removeAppointment(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

export const getAppointmentsForDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const date = req.query.date as string;
    const appointments = await getByDate(date);
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error getting appointments for date:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
