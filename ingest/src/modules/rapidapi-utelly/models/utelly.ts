import mongoose from "mongoose";

/**
 * Properties used to create a Utelly
 */
interface UtellyAttrs {
  imdbId: string;
  country: string;
  locations: {
    displayName: string;
    name: string;
    id: string;
    url: string;
  }[];
}

/**
 * Properties that a MovieId document has
 */
interface UtellyDoc extends mongoose.Document {
  imdbId: string;
  country: string;
  locations: {
    displayName: string;
    name: string;
    id: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MovieId mongoose schema
 */
const utellySchema = new mongoose.Schema(
  {
    imdbId: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
    },
    country: {
      type: String,
      required: true,
    },
    locations: {
      type: Array,
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

/**
 * Build wrapper (used to enforce MovieIdAttrs)
 */
interface UtellyModel extends mongoose.Model<UtellyDoc> {
  build(attrs: UtellyAttrs): UtellyDoc;
}

utellySchema.statics.build = (attrs: UtellyAttrs) => {
  return new Utelly(attrs);
};
/**
 * Initialize model
 */
const Utelly = mongoose.model<UtellyDoc, UtellyModel>("Utelly", utellySchema);

/**
 * Exports
 */
export { UtellyAttrs, UtellyModel, UtellyDoc, Utelly };
