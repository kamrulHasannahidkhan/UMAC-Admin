import { Schema, models, model } from "mongoose";

const AlumniSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    designation: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    passwordHash: { type: String, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Alumni || model("Alumni", AlumniSchema);
