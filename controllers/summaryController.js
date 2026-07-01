import Summary from "../models/Summary.js";
import Meeting from "../models/Meeting.js";

// =========================================
// Save Meeting Transcript & Summary
// =========================================
export const saveSummary = async (req, res) => {

    try {

        const {
            meetingId,
            transcript,
            summary,
            actionItems
        } = req.body;

        if (!meetingId) {

            return res.status(400).json({
                success: false,
                message: "Meeting ID is required"
            });

        }

        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {

            return res.status(404).json({
                success: false,
                message: "Meeting not found"
            });

        }

        let meetingSummary = await Summary.findOne({
            meetingId
        });

        if (meetingSummary) {

            meetingSummary.transcript = transcript;
            meetingSummary.summary = summary;
            meetingSummary.actionItems = actionItems;

            await meetingSummary.save();

            return res.status(200).json({
                success: true,
                message: "Summary Updated Successfully",
                meetingSummary
            });

        }

        meetingSummary = await Summary.create({

            meetingId,

            transcript,

            summary,

            actionItems

        });

        res.status(201).json({

            success: true,

            message: "Summary Saved Successfully",

            meetingSummary

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
// Get Summary By Meeting ID
// =========================================
export const getSummary = async (req, res) => {

    try {

        const summary = await Summary.findOne({

            meetingId: req.params.meetingId

        }).populate("meetingId", "title meetingCode");

        if (!summary) {

            return res.status(404).json({

                success: false,

                message: "Summary not found"

            });

        }

        res.status(200).json({

            success: true,

            summary

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
// Update Summary
// =========================================
export const updateSummary = async (req, res) => {

    try {

        const summary = await Summary.findById(req.params.id);

        if (!summary) {

            return res.status(404).json({

                success: false,

                message: "Summary not found"

            });

        }

        const updatedSummary = await Summary.findByIdAndUpdate(

            req.params.id,

            req.body,

            { new: true }

        );

        res.status(200).json({

            success: true,

            message: "Summary Updated",

            summary: updatedSummary

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
// Delete Summary
// =========================================
export const deleteSummary = async (req, res) => {

    try {

        const summary = await Summary.findById(req.params.id);

        if (!summary) {

            return res.status(404).json({

                success: false,

                message: "Summary not found"

            });

        }

        await summary.deleteOne();

        res.status(200).json({

            success: true,

            message: "Summary Deleted Successfully"

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
// Generate AI Summary (Placeholder)
// =========================================
export const generateAISummary = async (req, res) => {

    try {

        const { transcript } = req.body;

        if (!transcript) {

            return res.status(400).json({

                success: false,

                message: "Transcript is required"

            });

        }

        // Replace this with OpenAI / Hugging Face integration
        const aiSummary = transcript.substring(0, 300) + "...";

        const actionItems = [

            {
                task: "Review meeting discussion",
                assignedTo: "Team"
            }

        ];

        res.status(200).json({

            success: true,

            summary: aiSummary,

            actionItems

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
