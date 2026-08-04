import { Schema, models, model } from "mongoose";

const CampusLifeSchema = new Schema(
  {
    headingPlain: { type: String, required: true },
    headingHighlight: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.CampusLife || model("CampusLife", CampusLifeSchema);
