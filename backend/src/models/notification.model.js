import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: [
                'meeting_reminder',
                'meeting_started',
                'meeting_ended',
                'participant_joined',
                'participant_left',
                'chat_message',
                'file_shared',
                'meeting_scheduled',
                'meeting_cancelled',
                'system_notification'
            ],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        data: {
            meetingId: String,
            meetingTitle: String,
            participantName: String,
            fileName: String,
            fileUrl: String,
            scheduledTime: Date,
            additionalInfo: mongoose.Schema.Types.Mixed
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date
        },
        deliveredAt: {
            type: Date
        },
        scheduledFor: {
            type: Date
        },
        expiresAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);

export { Notification };
