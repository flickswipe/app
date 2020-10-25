import mongoose from "mongoose";

// An interface that describes the properties
// that are requried to create a new TmdbMovie
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

// An interface that describes the properties
// that a TmdbMovie Model has
interface TmdbMovieModel extends mongoose.Model<TmdbMovieDoc> {
  build(attrs: TmdbMovieAttrs): TmdbMovieDoc;
}

// An interface that describes the properties
// that a TmdbMovie Document has
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

const tmdbMovieSchema = new mongoose.Schema(
  {
    tmdbMovieId: {
      type: Number,
      required: true,
    },
    imdbId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    images: {
      type: Object,
      required: true,
    },
    genres: {
      type: Array,
      required: true,
    },
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

tmdbMovieSchema.statics.build = (attrs: TmdbMovieAttrs) => {
  const _id = mongoose.Types.ObjectId(`${attrs.imdbId}`.padStart(12, "0"));
  return new TmdbMovie(Object.assign({ _id }, attrs));
};

const TmdbMovie = mongoose.model<TmdbMovieDoc, TmdbMovieModel>(
  "TmdbMovie",
  tmdbMovieSchema
);

export { TmdbMovieAttrs, TmdbMovieModel, TmdbMovieDoc, TmdbMovie };
