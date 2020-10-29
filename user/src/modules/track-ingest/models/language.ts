import mongoose from "mongoose";
import { iso6391 } from "@flickswipe/common";

/**
 * Properties used to create a Language
 */
interface LanguageAttrs {
  language: iso6391;
}

/**
 * Properties that a Language document has
 */
interface LanguageDoc extends mongoose.Document {
  language: iso6391;
}

/**
 * Language mongoose schema
 */
const languageSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: false,
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/**
 * Build wrapper (used to enforce LanguageAttrs)
 */
interface LanguageModel extends mongoose.Model<LanguageDoc> {
  build(attrs: LanguageAttrs): LanguageDoc;
}

languageSchema.statics.build = (attrs: LanguageAttrs) => {
  return new Language(attrs);
};

/**
 * Initialize model
 */
const Language = mongoose.model<LanguageDoc, LanguageModel>(
  "Language",
  languageSchema
);

/**
 * Exports
 */
export { LanguageAttrs, LanguageModel, LanguageDoc, Language };
