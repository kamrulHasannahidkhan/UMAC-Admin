import { Schema, models, model } from "mongoose";

const CampusLifeCardSchema = new Schema(
  {
    label: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.CampusLifeCard || model("CampusLifeCard", CampusLifeCardSchema);
