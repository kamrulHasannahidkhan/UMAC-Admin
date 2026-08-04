import mongoose, { Schema, models, model } from "mongoose";

const SlideSchema = new Schema(
  {
    badge: { type: String, required: true },
    titleLine1: { type: String, required: true },
    highlight: { type: String, required: true },
    titleLine2: { type: String, default: "" },
    bgImage: { type: String, required: true }, // Cloudinary secure_url
    bgImagePublicId: { type: String, required: true }, // needed to delete from Cloudinary later
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Slide || model("Slide", SlideSchema);
