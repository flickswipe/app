import mongoose from "mongoose";

/**
 * Properties used to create a User
 */
interface UserAttrs {
  email: string;
}

/**
 * Properties that a User document has
 */
interface UserDoc extends mongoose.Document {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User mongoose schema
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
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

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

/**
 * Initialize model
 */
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

/**
 * Exports
 */
export { UserAttrs, UserModel, UserDoc, User };
