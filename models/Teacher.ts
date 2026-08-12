import { Schema, models, model } from "mongoose";

const TeacherSchema = new Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Teacher || model("Teacher", TeacherSchema);
