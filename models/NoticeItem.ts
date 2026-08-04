import { Schema, models, model } from "mongoose";

const NoticeItemSchema = new Schema(
  {
    board: { type: String, enum: ["notice", "publication"], required: true },
    category: { type: String, required: true },
    day: { type: String, required: true },
    month: { type: String, required: true },
    title: { type: String, required: true },
    time: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.NoticeItem || model("NoticeItem", NoticeItemSchema);
