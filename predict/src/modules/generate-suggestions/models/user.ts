import mongoose from "mongoose";

/**
 * Properties used to create a User
 */
interface UserAttrs {
  id: string;
  queueLength?: number;
}

/**
 * Properties that a User document has
 */
interface UserDoc extends mongoose.Document {
  id: string;
  queueLength: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User mongoose schema
 */
const userSchema = new mongoose.Schema(
  {
    queueLength: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
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

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(
    Object.assign({ _id: userSchema.statics.id(attrs.id) }, attrs)
  );
};

userSchema.statics.id = (value: string) => {
  return mongoose.Types.ObjectId(value);
};

/**
 * Initialize model
 */
const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

/**
 * Exports
 */
export { UserAttrs, UserModel, UserDoc, User };
