import Meeting from "../models/Meeting.js";
import User from "../models/User.js";

// =====================================
// Create Meeting
// =====================================
export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      meetingDate,
      duration,
    } = req.body;

    // Generate Unique Meeting Code
    const meetingCode =
      "INT-" +
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const meeting = await Meeting.create({
      title,
      description,
      meetingCode,
      host: req.user._id,
      participants: [req.user._id],
      meetingDate,
      duration,
    });

    res.status(201).json({
      success: true,
      message: "Meeting Created Successfully",
      meeting,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =====================================
// Get All Meetings
// =====================================
export const getMeetings = async (req, res) => {

  try {

    const meetings = await Meeting.find()
      .populate("host", "fullName email")
      .populate("participants", "fullName email");

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// =====================================
// Get Meeting By ID
// =====================================
export const getMeetingById = async (req, res) => {

  try {

    const meeting = await Meeting.findById(req.params.id)
      .populate("host", "fullName email")
      .populate("participants", "fullName email");

    if (!meeting) {

      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });

    }

    res.status(200).json({
      success: true,
      meeting,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// =====================================
// Update Meeting
// =====================================
export const updateMeeting = async (req, res) => {

  try {

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {

      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });

    }

    if (
      meeting.host.toString() !== req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message: "Only Host Can Update Meeting",
      });

    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Meeting Updated Successfully",
      meeting: updatedMeeting,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// =====================================
// Delete Meeting
// =====================================
export const deleteMeeting = async (req, res) => {

  try {

    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {

      return res.status(404).json({
        success: false,
        message: "Meeting Not Found",
      });

    }

    if (
      meeting.host.toString() !== req.user._id.toString()
    ) {

      return res.status(403).json({
        success: false,
        message: "Only Host Can Delete Meeting",
      });

    }

    await meeting.deleteOne();

    res.status(200).json({
      success: true,
      message: "Meeting Deleted Successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// =====================================
// Join Meeting Using Meeting Code
// =====================================
export const joinMeeting = async (req, res) => {

  try {

    const { meetingCode } = req.body;

    const meeting = await Meeting.findOne({
      meetingCode,
    });

    if (!meeting) {

      return res.status(404).json({
        success: false,
        message: "Invalid Meeting Code",
      });

    }

    if (
      !meeting.participants.includes(req.user._id)
    ) {

      meeting.participants.push(req.user._id);

      await meeting.save();

    }

    res.status(200).json({
      success: true,
      message: "Joined Meeting Successfully",
      meeting,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
