import { Schema, models, model } from "mongoose";

const StudentResultSchema = new Schema(
  {
    studentEmail: { type: String, required: true, lowercase: true, trim: true },
    year: { type: Number, enum: [1, 2, 3, 4], required: true },
    subject: { type: String, required: true },
    marks: { type: String, required: true },
    grade: { type: String, required: true },
    remarks: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.StudentResult || model("StudentResult", StudentResultSchema);
