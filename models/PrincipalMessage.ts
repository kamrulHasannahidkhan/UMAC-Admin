import { Schema, models, model } from "mongoose";

const PrincipalMessageSchema = new Schema(
  {
    badge: { type: String, required: true },
    headingPlain: { type: String, required: true },
    headingHighlight: { type: String, required: true },
    signatureImage: { type: String, required: true },
    signatureImagePublicId: { type: String, required: true },
    honorificLabel: { type: String, required: true },
    name: { type: String, required: true },
    positionTitle: { type: String, required: true },
    positionSuffix: { type: String, default: "" },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, required: true },
    photo: { type: String, required: true },
    photoPublicId: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.PrincipalMessage || model("PrincipalMessage", PrincipalMessageSchema);
