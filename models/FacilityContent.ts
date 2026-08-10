import { Schema, models, model } from "mongoose";

const FacilityContentItemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const FacilityContentSchema = new Schema(
  {
    section: { type: String, enum: ["hospital", "library", "meu", "training"], required: true, unique: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    stat1Label: { type: String },
    stat1Value: { type: String },
    stat2Label: { type: String },
    stat2Value: { type: String },
    items: { type: [FacilityContentItemSchema], default: [] },
    items2: { type: [FacilityContentItemSchema], default: [] },
  },
  { timestamps: true }
);

export default models.FacilityContent || model("FacilityContent", FacilityContentSchema);
