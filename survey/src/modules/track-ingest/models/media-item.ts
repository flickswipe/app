import mongoose from "mongoose";

/**
 * Properties used to create a MediaItem
 */
interface MediaItemAttrs {
  id: string;
  tmdbMovieId: number;
  imdbId: string;
  title: string;
  images: {
    poster: string;
    backdrop: string;
  };
  genres: string[];
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  audioLanguage: string;
  releaseDate: Date;
  runtime: number;
  plot: string | null;
  streamLocations: {
    [key: string]: {
      id: string;
      name: string;
      url: string;
    }[];
  };
}

/**
 * Properties that a MediaItem document has
 */
interface MediaItemDoc extends mongoose.Document {
  id: string;
  tmdbMovieId: number;
  imdbId: string;
  title: string;
  images: {
    poster: string;
    backdrop: string;
  };
  genres: string[];
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  audioLanguage: string;
  releaseDate: Date;
  runtime: number;
  plot: string | null;
  streamLocations: {
    [key: string]: {
      id: string;
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
      unique: true,
    },
    imdbId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    images: {
      type: Object,
      required: true,
    },
    genres: [{ type: String }],
    rating: {
      type: Object,
      required: true,
    },
    audioLanguage: {
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
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

/**
 * Build wrapper (used to enforce MediaItemAttrs)
 */
interface MediaItemModel extends mongoose.Model<MediaItemDoc> {
  build(attrs: MediaItemAttrs): MediaItemDoc;
  id(string: string): mongoose.Types.ObjectId;
}

mediaItem.statics.build = (attrs: MediaItemAttrs) => {
  return new MediaItem(
    Object.assign({ _id: mediaItem.statics.id(attrs.id) }, attrs)
  );
};

mediaItem.statics.id = (value: string) => {
  return mongoose.Types.ObjectId(value);
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
