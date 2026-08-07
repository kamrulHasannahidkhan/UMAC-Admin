import { Schema, models, model } from "mongoose";

const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Newsletter || model("Newsletter", NewsletterSchema);
