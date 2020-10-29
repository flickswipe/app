import mongoose from "mongoose";

/**
 * Properties used to create a StreamLocation
 */
interface StreamLocationAttrs {
  id: string;
  name: string;
  url: string;
  country: string;
}

/**
 * Properties that a StreamLocation document has
 */
interface StreamLocationDoc extends mongoose.Document {
  id: string;
  name: string;
  url: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * StreamLocation mongoose schema
 */
const streamLocationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    country: {
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

/**
 * Build wrapper (used to enforce StreamLocationAttrs)
 */
interface StreamLocationModel extends mongoose.Model<StreamLocationDoc> {
  build(attrs: StreamLocationAttrs): StreamLocationDoc;
  id(string: string): mongoose.Types.ObjectId;
}

streamLocationSchema.statics.build = (attrs: StreamLocationAttrs) => {
  return new StreamLocation(
    Object.assign({ _id: streamLocationSchema.statics.id(attrs.id) }, attrs)
  );
};

streamLocationSchema.statics.id = (string = "") => {
  return string
    ? mongoose.Types.ObjectId(string.padStart(24, "0").slice(-24))
    : mongoose.Types.ObjectId();
};

/**
 * Initialize model
 */
const StreamLocation = mongoose.model<StreamLocationDoc, StreamLocationModel>(
  "StreamLocation",
  streamLocationSchema
);

/**
 * Exports
 */
export {
  StreamLocationAttrs,
  StreamLocationModel,
  StreamLocationDoc,
  StreamLocation,
};
