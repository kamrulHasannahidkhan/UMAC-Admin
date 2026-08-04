import { Schema, models, model } from "mongoose";

const TestimonialsContentSchema = new Schema(
  {
    heading: { type: String, required: true },
    subheading: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.TestimonialsContent || model("TestimonialsContent", TestimonialsContentSchema);
