import { Schema, models, model } from "mongoose";

const AboutVisionSchema = new Schema(
  {
    heading: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.AboutVision || model("AboutVision", AboutVisionSchema);
