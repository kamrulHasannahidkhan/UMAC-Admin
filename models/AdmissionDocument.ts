import { Schema, models, model } from "mongoose";

const AdmissionDocumentSchema = new Schema(
  {
    category: { type: String, enum: ["papers", "forms", "results"], required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.AdmissionDocument || model("AdmissionDocument", AdmissionDocumentSchema);
