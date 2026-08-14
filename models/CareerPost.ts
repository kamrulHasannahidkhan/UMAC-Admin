import { Schema, models, model } from "mongoose";

const CareerPostSchema = new Schema(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, required: true }, // e.g. Full-time, Part-time, Contract
    deadline: { type: String, required: true },
    description: { type: String, required: true },
    applyLink: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.CareerPost || model("CareerPost", CareerPostSchema);
