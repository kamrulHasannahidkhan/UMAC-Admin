import { Schema, models, model } from "mongoose";

const AboutBannerSchema = new Schema(
  {
    headingPlain: { type: String, required: true },
    headingHighlight: { type: String, required: true },
    bgImage: { type: String, required: true },
    bgImagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.AboutBanner || model("AboutBanner", AboutBannerSchema);
