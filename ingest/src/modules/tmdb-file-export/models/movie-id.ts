import mongoose from "mongoose";

/**
 * Properties used to create a MovieId
 */
interface MovieIdAttrs {
  tmdbMovieId: number;
  timesUsed?: number;
  neverUse?: boolean;
  emitted?: boolean;
}

/**
 * Properties that a MovieId document has
 */
interface MovieIdDoc extends mongoose.Document {
  tmdbMovieId: number;
  timesUsed: number;
  neverUse: boolean;
  emitted: boolean;
}

/**
 * MovieId mongoose schema
 */
const movieIdSchema = new mongoose.Schema(
  {
    tmdbMovieId: {
      type: Number,
      required: true,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    neverUse: {
      type: Boolean,
      default: false,
    },
    emitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/**
 * Build wrapper (used to enforce MovieIdAttrs)
 */
interface MovieIdModel extends mongoose.Model<MovieIdDoc> {
  build(attrs: MovieIdAttrs): MovieIdDoc;
  id(string: string): mongoose.Types.ObjectId;
}

movieIdSchema.statics.build = (attrs: MovieIdAttrs) => {
  return new MovieId(
    Object.assign(
      { _id: movieIdSchema.statics.id(`${attrs.tmdbMovieId}`) },
      attrs
    )
  );
};

movieIdSchema.statics.id = (string = "") => {
  return string
    ? mongoose.Types.ObjectId(string.padStart(12, "0").slice(-12))
    : mongoose.Types.ObjectId();
};

/**
 * Initialize model
 */
const MovieId = mongoose.model<MovieIdDoc, MovieIdModel>(
  "MovieId",
  movieIdSchema
);

/**
 * Exports
 */
export { MovieIdAttrs, MovieIdModel, MovieIdDoc, MovieId };
