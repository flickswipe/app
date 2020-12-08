import mongoose from 'mongoose';

/**
 * Properties used to create a AudioLanguage
 */
interface AudioLanguageAttrs {
  audioLanguage: string;
}

/**
 * Properties that a AudioLanguage document has
 */
interface AudioLanguageDoc extends mongoose.Document {
  audioLanguage: string;
}

/**
 * AudioLanguage mongoose schema
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
 * Build wrapper (used to enforce AudioLanguageAttrs)
 */
interface AudioLanguageModel extends mongoose.Model<AudioLanguageDoc> {
  build(attrs: AudioLanguageAttrs): AudioLanguageDoc;
}

audioLanguageSchema.statics.build = (attrs: AudioLanguageAttrs) => {
  return new AudioLanguage(attrs);
};

/**
 * Initialize model
 */
const AudioLanguage = mongoose.model<AudioLanguageDoc, AudioLanguageModel>(
  "AudioLanguage",
  audioLanguageSchema
);

/**
 * Exports
 */
export {
  AudioLanguageAttrs,
  AudioLanguageModel,
  AudioLanguageDoc,
  AudioLanguage,
};
