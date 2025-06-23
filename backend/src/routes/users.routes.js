import {Router} from "express";
import { login, register, addToActivity, getAllActivity, createMeeting, getMeetingInfo } from "../controllers/user.controller.js";
import {
    validateLogin,
    validateRegistration,
    validateMeetingCreation,
    validateMeetingCode,
    validateToken
} from "../middleware/validation.js";

const router = Router();

router.route("/login").post(validateLogin, login)
router.route("/register").post(validateRegistration, register)
router.route("/add_to_activity").post(validateToken, validateMeetingCode, addToActivity)
router.route("/get_all_activity").get(validateToken, getAllActivity)
router.route("/create_meeting").post(validateToken, validateMeetingCreation, createMeeting)
router.route("/meeting/:meetingId").get(getMeetingInfo)

export default router;
