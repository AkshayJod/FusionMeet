import httpStatus from "http-status";
import { User } from '../models/user.model.js';
import { Meeting } from '../models/meeting.model.js';
import bcrypt, { hash } from "bcrypt"

import crypto from "crypto";
const login = async(req, res) => {
    const { username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({ message: "Please provide both username and password" });
    }

    try{
        const user = await User.findOne({username});
        if(!user){
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not Found " });
        }

        if(await bcrypt.compare(password, user.password)) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token, name: user.name, username: user.username});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }
    } catch(e){
        return res.status(500).json({message: `Something went wrong ${e}`})
    }
}

const register = async (req, res) => {
    const { name, username, password } =req.body;

    try{
        const existingUser  = await User.findOne({ username });
        if(existingUser){
           return res.status(httpStatus.FOUND).json({ message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });
       
       await newUser.save();

       res.status(httpStatus.CREATED).json({ message: "User registered successfully" });

    }  catch(e){
        res.json({ message: `Someting went wrong ${e}`});
       }

    }

// Helper function to verify token
const verifyToken = async (token) => {
    try {
        const user = await User.findOne({ token });
        return user;
    } catch (e) {
        return null;
    }
}

// Add meeting to user's activity history
const addToActivity = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const newMeeting = new Meeting({
            user_id: user._id,
            meetingCode: meeting_code,
            date: new Date()
        });

        await newMeeting.save();
        res.status(httpStatus.CREATED).json({ message: "Meeting added to history" });

    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
}

// Get all user's meeting activity
const getAllActivity = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const meetings = await Meeting.find({ user_id: user._id }).sort({ date: -1 });
        res.status(httpStatus.OK).json(meetings);

    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
}

// Create a new meeting
const createMeeting = async (req, res) => {
    const { token, meeting_title, scheduled_time, description, duration } = req.body;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        // Validate meeting title
        if (!meeting_title || !meeting_title.trim()) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Meeting title is required" });
        }

        // Validate scheduled time if provided
        if (scheduled_time) {
            const scheduledDate = new Date(scheduled_time);
            if (scheduledDate <= new Date()) {
                return res.status(httpStatus.BAD_REQUEST).json({ message: "Scheduled time must be in the future" });
            }
        }

        // Generate unique meeting ID (shorter and more user-friendly)
        const meetingId = crypto.randomBytes(4).toString('hex').toUpperCase();

        const newMeeting = new Meeting({
            user_id: user._id,
            meetingCode: meetingId,
            meetingTitle: meeting_title.trim(),
            scheduledTime: scheduled_time ? new Date(scheduled_time) : new Date(),
            date: new Date(),
            createdBy: user.name,
            description: description || '',
            duration: duration || 60 // Default 60 minutes
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({
            meetingId: meetingId,
            meetingTitle: newMeeting.meetingTitle,
            scheduledTime: newMeeting.scheduledTime,
            createdBy: newMeeting.createdBy,
            description: newMeeting.description,
            duration: newMeeting.duration,
            message: "Meeting created successfully"
        });

    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
}

// Get meeting information
const getMeetingInfo = async (req, res) => {
    const { meetingId } = req.params;

    try {
        const meeting = await Meeting.findOne({ meetingCode: meetingId }).populate('user_id', 'name username');

        if (!meeting) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Meeting not found" });
        }

        res.status(httpStatus.OK).json({
            meetingId: meeting.meetingCode,
            meetingTitle: meeting.meetingTitle,
            createdBy: meeting.createdBy,
            scheduledTime: meeting.scheduledTime,
            date: meeting.date
        });

    } catch (e) {
        res.status(500).json({ message: `Something went wrong ${e}` });
    }
}

export {login, register, addToActivity, getAllActivity, createMeeting, getMeetingInfo};
