import { Schema, models, model } from "mongoose";

const SustainabilitySchema = new Schema(
  {
    headingPlain: { type: String, required: true },
    headingHighlight: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Sustainability || model("Sustainability", SustainabilitySchema);
