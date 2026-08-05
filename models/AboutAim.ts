import { Schema, models, model } from "mongoose";

const ObjectiveSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const AboutAimSchema = new Schema(
  {
    aim: { type: String, required: true },
    objectives: { type: [ObjectiveSchema], default: [] },
  },
  { timestamps: true }
);

export default models.AboutAim || model("AboutAim", AboutAimSchema);
