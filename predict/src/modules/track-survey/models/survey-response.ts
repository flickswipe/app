import mongoose from "mongoose";

/**
 * Properties used to create a SurveyResponse
 */
interface SurveyResponseAttrs {
  user: string;
  mediaItem: string;
}

/**
 * Properties that a SurveyResponse document has
 */
interface SurveyResponseDoc extends mongoose.Document {
  id: string;
  user: string;
  mediaItem: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SurveyResponse mongoose schema
 */
const surveyResponse = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    mediaItem: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

/**
 * Build wrapper (used to enforce SurveyResponseAttrs)
 */
interface SurveyResponseModel extends mongoose.Model<SurveyResponseDoc> {
  build(attrs: SurveyResponseAttrs): SurveyResponseDoc;
}

surveyResponse.statics.build = (attrs: SurveyResponseAttrs) => {
  return new SurveyResponse(attrs);
};

/**
 * Initialize model
 */
const SurveyResponse = mongoose.model<SurveyResponseDoc, SurveyResponseModel>(
  "SurveyResponse",
  surveyResponse
);

/**
 * Exports
 */
export {
  SurveyResponseAttrs,
  SurveyResponseModel,
  SurveyResponseDoc,
  SurveyResponse,
};
