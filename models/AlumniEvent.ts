import { Schema, models, model } from "mongoose";

const AlumniEventSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.AlumniEvent || model("AlumniEvent", AlumniEventSchema);
