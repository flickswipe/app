import mongoose from 'mongoose';

/**
 * Properties used to create a TmdbGenre
 */
interface TmdbGenreAttrs {
  tmdbGenreId: number;
  name: string;
}

/**
 * Properties that a MovieId document has
 */
interface TmdbGenreDoc extends mongoose.Document {
  id: string;
  tmdbGenreId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TmdbGenre mongoose schema
 */
const tmdbGenreSchema = new mongoose.Schema(
  {
    tmdbGenreId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/**
 * Build wrapper (used to enforce TmdbGenreAttrs)
 */
interface TmdbGenreModel extends mongoose.Model<TmdbGenreDoc> {
  build(attrs: TmdbGenreAttrs): TmdbGenreDoc;
}

tmdbGenreSchema.statics.build = (attrs: TmdbGenreAttrs) => {
  return new TmdbGenre(attrs);
};

/**
 * Initialize model
 */
const TmdbGenre = mongoose.model<TmdbGenreDoc, TmdbGenreModel>(
  "TmdbGenre",
  tmdbGenreSchema
);

/**
 * Exports
 */
export { TmdbGenreAttrs, TmdbGenreModel, TmdbGenreDoc, TmdbGenre };
