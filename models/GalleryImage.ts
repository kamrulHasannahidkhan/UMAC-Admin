import { Schema, models, model } from "mongoose";

const GalleryImageSchema = new Schema(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    caption: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.GalleryImage || model("GalleryImage", GalleryImageSchema);
