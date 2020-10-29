import mongoose from "mongoose";

/**
 * Properties used to create a User
 */
interface UserAttrs {
  id: string;
  email: string;
}

/**
 * Properties that a MovieId document has
 */
interface UserDoc extends mongoose.Document {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User mongoose schema
 */
const genreSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    email: {
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
        delete ret.language;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

/**
 * Build wrapper (used to enforce UserAttrs)
 */
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

genreSchema.statics.build = (attrs: UserAttrs) => {
  return new User(Object.assign({ _id: attrs.id }, attrs));
};

/**
 * Initialize model
 */
const User = mongoose.model<UserDoc, UserModel>("User", genreSchema);

/**
 * Exports
 */
export { UserAttrs, UserModel, UserDoc, User };
