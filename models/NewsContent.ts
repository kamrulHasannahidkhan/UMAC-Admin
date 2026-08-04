import { Schema, models, model } from "mongoose";

const NewsContentSchema = new Schema(
  {
    heading: { type: String, required: true },
    subheading: { type: String, required: true },
    viewAllLink: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.NewsContent || model("NewsContent", NewsContentSchema);
