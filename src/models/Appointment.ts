import mongoose, {Document, Schema} from "mongoose";
import {IAppointment} from "../interfaces/interfaces.js";

interface IAppointmentModel extends IAppointment, Document {}

const appointmentSchema: Schema = new Schema({
  customerName: {type: String, required: true},
  email: {type: String, required: true},
  phone: {type: String, required: true},
  date: {type: Date, required: true},
  time: {type: String, required: true},
  service: {type: String, required: true},
  barber: {type: String, required: true},
  notes: {type: String},
});

const Appointment = mongoose.model<IAppointmentModel>(
  "Appointment",
  appointmentSchema
);

export default Appointment;
