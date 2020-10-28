import mongoose from "mongoose";
import { iso6391 } from "@flickswipe/common";

/**
 * Properties used to create a Language
 */
interface LanguageAttrs {
  id: string;
  language: iso6391;
}

/**
 * Properties that a Language document has
 */
interface LanguageDoc extends mongoose.Document {
  id: string;
  language: iso6391;
}

/**
 * Language mongoose schema
 */
const language = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
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

language.statics.build = (attrs: LanguageAttrs) => {
  return new Language(
    Object.assign({ _id: mongoose.Types.ObjectId(attrs.language) }, attrs)
  );
};

/**
 * Initialize model
 */
const Language = mongoose.model<LanguageDoc, LanguageModel>(
  "Language",
  language
);

/**
 * Exports
 */
export { LanguageAttrs, LanguageModel, LanguageDoc, Language };
