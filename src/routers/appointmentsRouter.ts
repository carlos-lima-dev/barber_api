// src/routers/appointmentsRouter.ts
import {Router} from "express";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsForDate,
} from "../controllers/appointmentsController.js";
import {check} from "express-validator";
const router = Router();

router.get("/", getAppointments);
router.post(
  "/",
  [
    check("email").isEmail().withMessage("Invalid email."),
    check("phone")
      .isLength({min: 9, max: 9})
      .withMessage("Invalid phone number"),
  ],
  createAppointment
);
router.put(
  "/:id",
  [
    check("email").isEmail().withMessage("Invalid email."),
    check("phone")
      .isLength({min: 9, max: 9})
      .withMessage("Invalid phone number"),
  ],
  updateAppointment
);
router.delete("/:id", deleteAppointment);
router.get("/by-date", getAppointmentsForDate);
export default router;
