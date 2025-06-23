import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        meetingCode: {type: String, required: true, unique: true},
        meetingTitle: {type: String, default: 'Untitled Meeting'},
        scheduledTime: {type: Date},
        createdBy: {type: String},
        description: {type: String, default: ''},
        duration: {type: Number, default: 60}, // Duration in minutes
        status: {type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled'},
        participants: [{
            userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            name: String,
            email: String,
            joinedAt: Date,
            leftAt: Date,
            role: {type: String, enum: ['host', 'participant'], default: 'participant'}
        }],
        // Recurring meeting settings
        isRecurring: {type: Boolean, default: false},
        recurrencePattern: {
            type: {type: String, enum: ['daily', 'weekly', 'monthly', 'yearly']},
            interval: {type: Number, default: 1}, // Every X days/weeks/months
            daysOfWeek: [Number], // For weekly: 0=Sunday, 1=Monday, etc.
            dayOfMonth: Number, // For monthly
            endDate: Date,
            occurrences: Number // Number of occurrences
        },
        parentMeetingId: {type: mongoose.Schema.Types.ObjectId, ref: 'Meeting'}, // For recurring instances
        // Meeting settings
        settings: {
            allowParticipantsToJoinBeforeHost: {type: Boolean, default: true},
            muteParticipantsOnEntry: {type: Boolean, default: false},
            requirePassword: {type: Boolean, default: false},
            password: String,
            waitingRoom: {type: Boolean, default: false},
            recordMeeting: {type: Boolean, default: false},
            maxParticipants: {type: Number, default: 100}
        },
        // Meeting analytics
        analytics: {
            totalParticipants: {type: Number, default: 0},
            peakParticipants: {type: Number, default: 0},
            actualDuration: Number, // in minutes
            startedAt: Date,
            endedAt: Date
        },
        date: {type: Date, default: Date.now, required: true}
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
)

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };