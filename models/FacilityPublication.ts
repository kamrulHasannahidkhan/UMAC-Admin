import { Schema, models, model } from "mongoose";

const FacilityPublicationSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.FacilityPublication || model("FacilityPublication", FacilityPublicationSchema);
