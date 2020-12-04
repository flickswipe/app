import mongoose from "mongoose";

/**
 * Properties used to create a Language
 */
interface LanguageAttrs {
  audioLanguage: string;
}

/**
 * Properties that a Language document has
 */
interface LanguageDoc extends mongoose.Document {
  audioLanguage: string;
}

/**
 * Language mongoose schema
 */
const audioLanguageSchema = new mongoose.Schema(
  {
    audioLanguage: {
      type: String,
      required: true,
      unique: true,
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

audioLanguageSchema.statics.build = (attrs: LanguageAttrs) => {
  return new Language(attrs);
};

/**
 * Initialize model
 */
const Language = mongoose.model<LanguageDoc, LanguageModel>(
  "Language",
  audioLanguageSchema
);

/**
 * Exports
 */
export { LanguageAttrs, LanguageModel, LanguageDoc, Language };
