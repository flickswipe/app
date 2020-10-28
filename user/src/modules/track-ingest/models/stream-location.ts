import mongoose from "mongoose";

/**
 * Properties used to create a StreamLocation
 */
interface StreamLocationAttrs {
  ingestId: string;
  name: string;
  url: string;
  country: string;
}

/**
 * Properties that a StreamLocation document has
 */
interface StreamLocationDoc extends mongoose.Document {
  ingestId: string;
  name: string;
  url: string;
  country: string;
}

/**
 * StreamLocation mongoose schema
 */
const streamLocation = new mongoose.Schema(
  {
    ingestId: {
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
    versionKey: false,
    timestamps: false,
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
}

streamLocation.statics.build = (attrs: StreamLocationAttrs) => {
  return new StreamLocation(
    Object.assign({ _id: mongoose.Types.ObjectId(attrs.ingestId) }, attrs)
  );
};

/**
 * Initialize model
 */
const StreamLocation = mongoose.model<StreamLocationDoc, StreamLocationModel>(
  "StreamLocation",
  streamLocation
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
