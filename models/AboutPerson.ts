import { Schema, models, model } from "mongoose";

const AboutPersonSchema = new Schema(
  {
    group: { type: String, enum: ["founder-member", "former-vc", "former-principal", "ec-member", "gb-member"], required: true },
    title: { type: String, required: true },
    photo: { type: String, required: true },
    photoPublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.AboutPerson || model("AboutPerson", AboutPersonSchema);
