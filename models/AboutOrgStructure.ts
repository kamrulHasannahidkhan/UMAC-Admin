import { Schema, models, model } from "mongoose";

const AboutOrgStructureSchema = new Schema(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.AboutOrgStructure || model("AboutOrgStructure", AboutOrgStructureSchema);
