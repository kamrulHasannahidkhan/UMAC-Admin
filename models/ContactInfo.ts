import { Schema, models, model } from "mongoose";

const ContactInfoSchema = new Schema(
  {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },
    hoursWeekday: { type: String, required: true },
    hoursWeekend: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.ContactInfo || model("ContactInfo", ContactInfoSchema);
