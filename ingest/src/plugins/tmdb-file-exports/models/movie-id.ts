import mongoose from "mongoose";

// An interface that describes the properties
// that are requried to create a new MovieId
interface MovieIdAttrs {
  tmdbMovieId: number;
  timesUsed?: number;
  neverUse?: boolean;
  emitted?: boolean;
}

// An interface that describes the properties
// that a MovieId Model has
interface MovieIdModel extends mongoose.Model<MovieIdDoc> {
  build(attrs: MovieIdAttrs): MovieIdDoc;
}

// An interface that describes the properties
// that a MovieId Document has
interface MovieIdDoc extends mongoose.Document {
  tmdbMovieId: number;
  timesUsed: number;
  neverUse: boolean;
  emitted: boolean;
}

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

movieIdSchema.statics.build = (attrs: MovieIdAttrs) => {
  const _id = mongoose.Types.ObjectId(`${attrs.tmdbMovieId}`.padStart(12, "0"));
  return new MovieId(Object.assign({ _id }, attrs));
};

const MovieId = mongoose.model<MovieIdDoc, MovieIdModel>(
  "MovieId",
  movieIdSchema
);

export { MovieIdAttrs, MovieIdModel, MovieIdDoc, MovieId };
