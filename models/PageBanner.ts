
import { Schema, models, model } from "mongoose";

const PageBannerSchema = new Schema(

  {

    titlePlain: { type: String, required: true },

    titleHighlight: { type: String, required: true },

    description: { type: String, required: true },

    buttonText: { type: String, required: true },

    bgImage: { type: String, required: true },

    bgImagePublicId: { type: String, required: true },

  },

  { timestamps: true }

);

export default models.PageBanner || model("PageBanner", PageBannerSchema);

