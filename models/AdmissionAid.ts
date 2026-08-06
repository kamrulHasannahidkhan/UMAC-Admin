import { Schema, models, model } from "mongoose";

const AdmissionAidSchema = new Schema(
  {
    heading: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.AdmissionAid || model("AdmissionAid", AdmissionAidSchema);
