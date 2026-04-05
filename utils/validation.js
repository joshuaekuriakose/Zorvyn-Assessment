const Joi = require("joi");

// Full schema — used on CREATE (all required fields enforced)
exports.recordSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.base":     "Amount must be a number",
    "number.positive": "Amount must be positive",
    "any.required":    "Amount is required"
  }),
  type: Joi.string().valid("income", "expense").required().messages({
    "any.only":     'Type must be "income" or "expense"',
    "any.required": "Type is required"
  }),
  category: Joi.string().trim().required().messages({
    "any.required": "Category is required"
  }),
  date: Joi.date().required().messages({
    "date.base":    "Date must be a valid date",
    "any.required": "Date is required"
  }),
  note:   Joi.string().allow("").optional(),
  status: Joi.string().valid("pending", "completed").default("pending")
});

// Partial schema — used on UPDATE (all fields optional, but if supplied must be valid)
exports.updateRecordSchema = Joi.object({
  amount: Joi.number().positive().messages({
    "number.base":     "Amount must be a number",
    "number.positive": "Amount must be positive"
  }),
  type: Joi.string().valid("income", "expense").messages({
    "any.only": 'Type must be "income" or "expense"'
  }),
  category: Joi.string().trim(),
  date:     Joi.date().messages({ "date.base": "Date must be a valid date" }),
  note:     Joi.string().allow("").optional(),
  status:   Joi.string().valid("pending", "completed")
}).min(1); // at least one field required (body-empty check is done before this, but this is a safety net)
