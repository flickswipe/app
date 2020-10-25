import mongoose from "mongoose";

// An interface that describes the properties
// that are requried to create a new Utelly
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

// An interface that describes the properties
// that a Utelly Model has
interface UtellyModel extends mongoose.Model<UtellyDoc> {
  build(attrs: UtellyAttrs): UtellyDoc;
}

// An interface that describes the properties
// that a Utelly Document has
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

const utellySchema = new mongoose.Schema(
  {
    imdbId: {
      type: String,
      required: true,
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

utellySchema.statics.build = (attrs: UtellyAttrs) => {
  const _id = mongoose.Types.ObjectId(`${attrs.imdbId}`.padStart(12, "0"));
  return new Utelly(Object.assign({ _id }, attrs));
};

const Utelly = mongoose.model<UtellyDoc, UtellyModel>("Utelly", utellySchema);

export { UtellyAttrs, UtellyModel, UtellyDoc, Utelly };
