import mongoose from 'mongoose';

/**
 * Properties used to create a Genre
 */
interface GenreAttrs {
  id: string;
  tmdbGenreId: number;
  name: string;
}

/**
 * Properties that a MovieId document has
 */
interface GenreDoc extends mongoose.Document {
  id: string;
  tmdbGenreId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Genre mongoose schema
 */
const genreSchema = new mongoose.Schema(
  {
    tmdbGenreId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = `${ret._id}`;
        delete ret._id;
        delete ret.__v;
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
  id(value: string): mongoose.Types.ObjectId;
}

genreSchema.statics.build = (attrs: GenreAttrs) => {
  return new Genre(
    Object.assign({ _id: genreSchema.statics.id(attrs.id) }, attrs)
  );
};

genreSchema.statics.id = (value: string) => {
  return mongoose.Types.ObjectId(value);
};

/**
 * Initialize model
 */
const Genre = mongoose.model<GenreDoc, GenreModel>("Genre", genreSchema);

/**
 * Exports
 */
export { GenreAttrs, GenreModel, GenreDoc, Genre };
