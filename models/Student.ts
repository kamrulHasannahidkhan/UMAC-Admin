import { Schema, models, model } from "mongoose";

const StudentSchema = new Schema(
  {
    name: { type: String, required: true },
    studentId: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Student || model("Student", StudentSchema);
