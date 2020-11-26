import mongoose from "mongoose";
import { iso6391 } from "@flickswipe/common";

/**
 * Properties used to create a Genre
 */
interface GenreAttrs {
  genreId: string;
  name: string;
  language: iso6391;
}

/**
 * Properties that a MovieId document has
 */
interface GenreDoc extends mongoose.Document {
  id: string;
  genreId: string;
  name: string;
  language: iso6391;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Genre mongoose schema
 */
const genreSchema = new mongoose.Schema(
  {
    genreId: {
      type: String,
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
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.language;
        delete ret.createdAt;
        delete ret.updatedAt;
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
  return new Genre(attrs);
};

/**
 * Initialize model
 */
const Genre = mongoose.model<GenreDoc, GenreModel>("Genre", genreSchema);

/**
 * Exports
 */
export { GenreAttrs, GenreModel, GenreDoc, Genre };
