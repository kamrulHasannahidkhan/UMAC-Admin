
import { Schema, models, model } from "mongoose";

const DepartmentSearchSchema = new Schema(

  {

    heading: { type: String, required: true },

    description: { type: String, required: true },

    searchPlaceholder: { type: String, required: true },

    popularSearches: { type: [String], default: [] },

    popularProgram: {

      type: {

        title: String,

        image: String,

        imagePublicId: String,

      },

      default: null,

    },

    sideImage1: { type: String, required: true },

    sideImage1PublicId: { type: String, required: true },

    sideImage2: { type: String, required: true },

    sideImage2PublicId: { type: String, required: true },

    badgeNumber: { type: String, required: true },

    badgeText: { type: String, required: true },

  },

  { timestamps: true }

);

export default models.DepartmentSearch || model("DepartmentSearch", DepartmentSearchSchema);

