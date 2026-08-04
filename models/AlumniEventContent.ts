import { Schema, models, model } from "mongoose";

const AlumniEventContentSchema = new Schema(
  {
    heading: { type: String, required: true },
    viewAllLink: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.AlumniEventContent || model("AlumniEventContent", AlumniEventContentSchema);
