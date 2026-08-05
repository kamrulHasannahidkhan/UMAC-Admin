import { Schema, models, model } from "mongoose";

const AdmissionAidLinkSchema = new Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.AdmissionAidLink || model("AdmissionAidLink", AdmissionAidLinkSchema);
