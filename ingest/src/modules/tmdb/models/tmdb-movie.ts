import mongoose from "mongoose";

/**
 * Properties used to create a TmdbMovie
 */
interface TmdbMovieAttrs {
  tmdbMovieId: number;
  imdbId: string;
  title: string;
  images: {
    poster: string;
    backdrop: string;
  };
  genres: number[];
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  language: string;
  releaseDate: Date;
  runtime: number;
  plot: string | null;
  timesUsed?: number;
  neverUse?: boolean;
}

/**
 * Properties that a TmdbMovie document has
 */
interface TmdbMovieDoc extends mongoose.Document {
  tmdbMovieId: number;
  imdbId: string;
  title: string;
  images: {
    poster: string;
    backdrop: string;
  };
  genres: number[];
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  language: string;
  releaseDate: Date;
  runtime: number;
  plot: string | null;
  timesUsed: number;
  neverUse: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TmdbMovie mongoose schema
 */
const tmdbMovieSchema = new mongoose.Schema(
  {
    tmdbMovieId: {
      type: Number,
      required: true,
      unique: true,
      dropDups: true,
    },
    imdbId: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
    },
    title: {
      type: String,
      required: true,
    },
    images: {
      type: Object,
      required: true,
    },
    genres: [
      {
        type: Number,
      },
    ],
    rating: {
      type: Object,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    runtime: {
      type: Number,
      required: true,
    },
    plot: {
      type: String,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    neverUse: {
      type: Boolean,
      default: false,
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
 * Build wrapper (used to enforce TmdbMovieAttrs)
 */
interface TmdbMovieModel extends mongoose.Model<TmdbMovieDoc> {
  build(attrs: TmdbMovieAttrs): TmdbMovieDoc;
}

tmdbMovieSchema.statics.build = (attrs: TmdbMovieAttrs) => {
  return new TmdbMovie(attrs);
};

/**
 * Initialize model
 */
const TmdbMovie = mongoose.model<TmdbMovieDoc, TmdbMovieModel>(
  "TmdbMovie",
  tmdbMovieSchema
);

/**
 * Exports
 */
export { TmdbMovieAttrs, TmdbMovieModel, TmdbMovieDoc, TmdbMovie };
