import { Schema, models, model } from "mongoose";

const StudentPortalPostSchema = new Schema(
  {
    type: { type: String, enum: ["news", "publication", "notice"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    fileUrl: { type: String, default: "" },
    filePublicId: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.StudentPortalPost || model("StudentPortalPost", StudentPortalPostSchema);
