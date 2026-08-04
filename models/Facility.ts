import { Schema, models, model } from "mongoose";

const FacilitySchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Facility || model("Facility", FacilitySchema);
