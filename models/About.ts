
import { Schema, models, model } from "mongoose";

const AboutSchema = new Schema(

  {

    badge: { type: String, required: true },

    headingPlain: { type: String, required: true },

    headingHighlight: { type: String, required: true },

    paragraph1: { type: String, required: true },

    paragraph2: { type: String, required: true },

    image1: { type: String, required: true },

    image1PublicId: { type: String, required: true },

    image2: { type: String, required: true },

    image2PublicId: { type: String, required: true },

  },

  { timestamps: true }

);

export default models.About || model("About", AboutSchema);

