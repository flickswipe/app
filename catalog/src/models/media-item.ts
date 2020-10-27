import mongoose from "mongoose";

/**
 * Properties used to create a MediaItem
 */
interface MediaItemAttrs {
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
  streamLocations: {
    [key: string]: {
      name: string;
      url: string;
    }[];
  };
}

/**
 * Properties that a MediaItem document has
 */
interface MediaItemDoc extends mongoose.Document {
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
  streamLocations: {
    [key: string]: {
      name: string;
      url: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MediaItem mongoose schema
 */
const mediaItem = new mongoose.Schema(
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
    streamLocations: {
      type: Object,
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
 * Build wrapper (used to enforce MediaItemAttrs)
 */
interface MediaItemModel extends mongoose.Model<MediaItemDoc> {
  build(attrs: MediaItemAttrs): MediaItemDoc;
}

mediaItem.statics.build = (attrs: MediaItemAttrs) => {
  const _id = mongoose.Types.ObjectId(`${attrs.imdbId}`.padStart(12, "0"));
  return new MediaItem(Object.assign({ _id }, attrs));
};

/**
 * Initialize model
 */
const MediaItem = mongoose.model<MediaItemDoc, MediaItemModel>(
  "MediaItem",
  mediaItem
);

/**
 * Exports
 */
export { MediaItemAttrs, MediaItemModel, MediaItemDoc, MediaItem };
