import { Schema, models, model } from "mongoose";

const AboutHistorySchema = new Schema(
  {
    year: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.AboutHistory || model("AboutHistory", AboutHistorySchema);
