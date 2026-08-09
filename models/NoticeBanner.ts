import { Schema, models, model } from "mongoose";

const NoticeBannerSchema = new Schema(
  {
    headingPlain: { type: String, required: true },
    headingHighlight: { type: String, required: true },
    bgImage: { type: String, required: true },
    bgImagePublicId: { type: String, required: true },
    logoImage: { type: String },
    logoImagePublicId: { type: String },
  },
  { timestamps: true }
);

export default models.NoticeBanner || model("NoticeBanner", NoticeBannerSchema);
