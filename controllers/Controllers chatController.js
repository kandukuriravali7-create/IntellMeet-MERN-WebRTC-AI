import Chat from "../models/Chat.js";
import Meeting from "../models/Meeting.js";

// =========================================
// Send Message
// =========================================
export const sendMessage = async (req, res) => {

    try {

        const { meetingId, message } = req.body;

        if (!meetingId || !message) {

            return res.status(400).json({
                success: false,
                message: "Meeting ID and Message are required"
            });

        }

        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {

            return res.status(404).json({
                success: false,
                message: "Meeting not found"
            });

        }

        const newMessage = await Chat.create({

            meetingId,

            sender: req.user._id,

            message

        });

        const chat = await Chat.findById(newMessage._id)
            .populate("sender", "fullName email avatar")
            .populate("meetingId", "title meetingCode");

        res.status(201).json({

            success: true,

            message: "Message Sent",

            chat

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// =========================================
// Get Meeting Chat
// =========================================
export const getMeetingChat = async (req, res) => {

    try {

        const { meetingId } = req.params;

        const chats = await Chat.find({

            meetingId

        })

            .populate("sender", "fullName avatar email")

            .sort({

                createdAt: 1

            });

        res.status(200).json({

            success: true,

            totalMessages: chats.length,

            chats

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// =========================================
// Delete Message
// =========================================
export const deleteMessage = async (req, res) => {

    try {

        const chat = await Chat.findById(req.params.id);

        if (!chat) {

            return res.status(404).json({

                success: false,

                message: "Message not found"

            });

        }

        if (chat.sender.toString() !== req.user._id.toString()) {

            return res.status(403).json({

                success: false,

                message: "You can delete only your own messages."

            });

        }

        await chat.deleteOne();

        res.status(200).json({

            success: true,

            message: "Message Deleted Successfully"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
