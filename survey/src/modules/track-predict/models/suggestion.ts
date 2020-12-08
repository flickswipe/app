import mongoose from 'mongoose';

/**
 * Properties used to create a Suggestion
 */
interface SuggestionAttrs {
  user: string;
  mediaItem: string;
}

/**
 * Properties that a Suggestion document has
 */
interface SuggestionDoc extends mongoose.Document {
  id: string;
  user: string;
  mediaItem: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Suggestion mongoose schema
 */
const suggestion = new mongoose.Schema(
  {
    user: { type: String, required: true },
    mediaItem: { type: String, required: true },
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
 * Build wrapper (used to enforce SuggestionAttrs)
 */
interface SuggestionModel extends mongoose.Model<SuggestionDoc> {
  build(attrs: SuggestionAttrs): SuggestionDoc;
  id(string: string): mongoose.Types.ObjectId;
}

suggestion.statics.build = (attrs: SuggestionAttrs) => {
  return new Suggestion(attrs);
};

/**
 * Initialize model
 */
const Suggestion = mongoose.model<SuggestionDoc, SuggestionModel>(
  "Suggestion",
  suggestion
);

/**
 * Exports
 */
export { SuggestionAttrs, SuggestionModel, SuggestionDoc, Suggestion };
