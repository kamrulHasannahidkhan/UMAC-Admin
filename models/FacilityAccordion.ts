import { Schema, models, model } from "mongoose";

const AccordionItemSchema = new Schema(
  {
    group: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    imagePublicId: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const FacilityAccordionSchema = new Schema(
  {
    section: { type: String, enum: ["seminar", "hostel", "laboratory", "cafeteria"], required: true, unique: true },
    heading: { type: String, required: true },
    description: { type: String },
    items: { type: [AccordionItemSchema], default: [] },
  },
  { timestamps: true }
);

export default models.FacilityAccordion || model("FacilityAccordion", FacilityAccordionSchema);
