import mongoose from "mongoose";

// An interface that describes the properties
// that are requried to create a new TmdbGenre
interface TmdbGenreAttrs {
  tmdbGenreId: number;
  name: string;
  language: string;
}

// An interface that describes the properties
// that a TmdbGenre Model has
interface TmdbGenreModel extends mongoose.Model<TmdbGenreDoc> {
  build(attrs: TmdbGenreAttrs): TmdbGenreDoc;
}

// An interface that describes the properties
// that a TmdbGenre Document has
interface TmdbGenreDoc extends mongoose.Document {
  tmdbGenreId: number;
  name: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const tmdbGenreSchema = new mongoose.Schema(
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

tmdbGenreSchema.statics.build = (attrs: TmdbGenreAttrs) => {
  const _id = mongoose.Types.ObjectId(`${attrs.tmdbGenreId}`.padStart(12, "0"));
  return new TmdbGenre(Object.assign({ _id }, attrs));
};

const TmdbGenre = mongoose.model<TmdbGenreDoc, TmdbGenreModel>(
  "TmdbGenre",
  tmdbGenreSchema
);

export { TmdbGenreAttrs, TmdbGenreModel, TmdbGenreDoc, TmdbGenre };
