import { Schema, models, model } from "mongoose";

const TestimonialSchema = new Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    quote: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String, required: true },
    avatarPublicId: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Testimonial || model("Testimonial", TestimonialSchema);
