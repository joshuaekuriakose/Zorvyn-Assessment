const Record = require("../models/Record");

exports.getDashboardStats = async (req, res) => {
  try {
    const income = await Record.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const expense = await Record.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalIncome  = income[0]?.total  || 0;
    const totalExpense = expense[0]?.total || 0;

    res.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategorySummary = async (req, res) => {
  try {
    const data = await Record.aggregate([
      {
        $group: {
          _id:   "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          type:  { $first: "$type" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecent = async (req, res) => {
  try {
    const limit   = parseInt(req.query.limit) || 5;
    const records = await Record.find()
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 20)); // cap at 20

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Monthly trends for the last N months (default 6)
// Returns: [{ year, month, income, expense, net }]
exports.getMonthlyTrends = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;

    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const data = await Record.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: {
            year:  { $year: "$date" },
            month: { $month: "$date" },
            type:  "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Pivot income/expense into one object per month
    const map = {};
    data.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, "0")}`;
      if (!map[key]) map[key] = { year: _id.year, month: _id.month, income: 0, expense: 0 };
      map[key][_id.type] = total;
    });

    const result = Object.values(map).map(m => ({
      ...m,
      net: m.income - m.expense,
      label: new Date(m.year, m.month - 1).toLocaleString("en-IN", { month: "short", year: "numeric" })
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Weekly trends for the last N weeks (default 8)
// Returns: [{ week, year, startDate, income, expense, net }]
exports.getWeeklyTrends = async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 8;

    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);
    since.setHours(0, 0, 0, 0);

    const data = await Record.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const map = {};
    data.forEach(({ _id, total }) => {
      const key = `${_id.year}-W${String(_id.week).padStart(2, "0")}`;
      if (!map[key]) map[key] = { year: _id.year, week: _id.week, label: key, income: 0, expense: 0 };
      map[key][_id.type] = total;
    });

    const result = Object.values(map).map(m => ({
      ...m,
      net: m.income - m.expense
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
