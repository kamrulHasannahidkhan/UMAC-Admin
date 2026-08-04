import { Schema, models, model } from "mongoose";

const NewsPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.NewsPost || model("NewsPost", NewsPostSchema);
