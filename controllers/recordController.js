const Record = require("../models/Record");
const { recordSchema, updateRecordSchema } = require("../utils/validation");
const mongoose = require("mongoose");

exports.createRecord = async (req, res) => {
  try {
    const { error } = recordSchema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      return res.status(400).json({
        message: error.details.map(err => err.message)
      });
    }

    const record = await Record.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};
    if (req.query.status)   filter.status = req.query.status;
    if (req.query.type)     filter.type   = req.query.type;
    if (req.query.category) filter.category = new RegExp(req.query.category, "i");

    // Date range filtering — ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (isNaN(start)) return res.status(400).json({ message: "Invalid startDate" });
        filter.date.$gte = start;
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (isNaN(end)) return res.status(400).json({ message: "Invalid endDate" });
        end.setHours(23, 59, 59, 999); // include the full end day
        filter.date.$lte = end;
      }
    }

    const total   = await Record.countDocuments(filter);
    const records = await Record.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ total, page, limit, data: records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecordById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRecord = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  if (!Object.keys(req.body).length) {
    return res.status(400).json({ message: "No data provided" });
  }

  // Validate only the fields that are being updated (partial schema)
  const { error } = updateRecordSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false
  });
  if (error) {
    return res.status(400).json({
      message: error.details.map(e => e.message)
    });
  }

  try {
    const record = await Record.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const total     = await Record.countDocuments();
    const completed = await Record.countDocuments({ status: "completed" });
    const pending   = await Record.countDocuments({ status: "pending" });

    res.json({ total, completed, pending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
