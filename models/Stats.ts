
import { Schema, models, model } from "mongoose";

const StatSchema = new Schema(

  {

    number: { type: String, required: true },

    label: { type: String, required: true },

  },

  { _id: false }

);

const StatsSchema = new Schema(

  {

    bgImage: { type: String, required: true },

    bgImagePublicId: { type: String, required: true },

    stats: { type: [StatSchema], required: true },

  },

  { timestamps: true }

);

export default models.Stats || model("Stats", StatsSchema);

