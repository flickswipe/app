import mongoose from "mongoose";
import { iso6391 } from "@flickswipe/common";

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
  language: iso6391;
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
  genres: string[] | { id: string; name: string }[];
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  language: iso6391;
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
  streamLocationIds: string[];
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
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
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
    streamLocationIds: {
      type: [{ type: String }],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.streamLocationIds;
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
    Object.assign(
      {
        _id: mediaItem.statics.id(attrs.id),
        streamLocationIds: mediaItem.statics.streamLocationIds(
          attrs.streamLocations
        ),
      },
      attrs
    )
  );
};

mediaItem.statics.id = (string = "") => {
  return string
    ? mongoose.Types.ObjectId(string.padStart(24, "0").slice(-24))
    : mongoose.Types.ObjectId();
};

mediaItem.statics.streamLocationIds = (streamLocations: {
  [country: string]: { id: string };
}) => {
  return Object.values(streamLocations)
    .flat()
    .map(({ id }: { id: string }) => id);
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
