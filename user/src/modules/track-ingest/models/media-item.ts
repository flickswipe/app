import mongoose, { Schema } from "mongoose";

/**
 * Properties used to create a MediaItem
 */
interface MediaItemAttrs {
  id: string;
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  releaseDate: Date;
  runtime: number;
  streamLocations: string[];
  language: string;
  genres: string[];
}

/**
 * Properties that a MediaItem document has
 */
interface MediaItemDoc extends mongoose.Document {
  id: string;
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  releaseDate: Date;
  runtime: number;
  streamLocations: string[];
  language: string;
  genres: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MediaItem mongoose schema
 */
const mediaItem = new mongoose.Schema(
  {
    rating: {
      type: Object,
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
    genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    streamLocations: [{ type: Schema.Types.ObjectId, ref: "StreamLocation" }],
    language: { type: Schema.Types.ObjectId, ref: "Language" },
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
}

mediaItem.statics.build = (attrs: MediaItemAttrs) => {
  return new MediaItem(
    Object.assign({ _id: mongoose.Types.ObjectId(attrs.id) }, attrs)
  );
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
