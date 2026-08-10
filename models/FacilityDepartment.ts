import { Schema, models, model } from "mongoose";

const FacilityDepartmentSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    establishedDate: { type: String, required: true },
    learnMoreLink: { type: String, default: "#" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.FacilityDepartment || model("FacilityDepartment", FacilityDepartmentSchema);
