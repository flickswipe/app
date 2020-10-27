import mongoose from "mongoose";

/**
 * Properties used to create a Genre
 */
interface GenreAttrs {
  tmdbGenreId: number;
  name: string;
  language: string;
}

/**
 * Properties that a MovieId document has
 */
interface GenreDoc extends mongoose.Document {
  tmdbGenreId: number;
  name: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Genre mongoose schema
 */
const genreSchema = new mongoose.Schema(
  {
    tmdbGenreId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    language: {
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
      },
    },
  }
);

/**
 * Build wrapper (used to enforce GenreAttrs)
 */
interface GenreModel extends mongoose.Model<GenreDoc> {
  build(attrs: GenreAttrs): GenreDoc;
}

genreSchema.statics.build = (attrs: GenreAttrs) => {
  const _id = mongoose.Types.ObjectId(`${attrs.tmdbGenreId}`.padStart(12, "0"));
  return new Genre(Object.assign({ _id }, attrs));
};

/**
 * Initialize model
 */
const Genre = mongoose.model<GenreDoc, GenreModel>("Genre", genreSchema);

/**
 * Exports
 */
export { GenreAttrs, GenreModel, GenreDoc, Genre };
