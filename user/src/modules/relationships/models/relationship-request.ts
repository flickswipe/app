import mongoose, { Schema } from "mongoose";
import { UserDoc } from "../../track-auth/models/user";

/**
 * Properties used to create a RelationshipRequest
 */
interface RelationshipRequestAttrs {
  sourceUser: string;
  targetUser: string;
  complete?: boolean;
}

/**
 * Properties that a RelationshipRequest document has
 */
interface RelationshipRequestDoc extends mongoose.Document {
  sourceUser: string | UserDoc;
  targetUser: string | UserDoc;
  complete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * RelationshipRequest mongoose schema
 */
const relationshipRequestSchema = new mongoose.Schema(
  {
    sourceUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
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
 * Build wrapper (used to enforce RelationshipRequestAttrs)
 */
interface RelationshipRequestModel
  extends mongoose.Model<RelationshipRequestDoc> {
  build(attrs: RelationshipRequestAttrs): RelationshipRequestDoc;
}

relationshipRequestSchema.statics.build = (attrs: RelationshipRequestAttrs) => {
  return new RelationshipRequest(attrs);
};

/**
 * Initialize model
 */
const RelationshipRequest = mongoose.model<
  RelationshipRequestDoc,
  RelationshipRequestModel
>("RelationshipRequest", relationshipRequestSchema);

/**
 * Exports
 */
export {
  RelationshipRequestAttrs,
  RelationshipRequestModel,
  RelationshipRequestDoc,
  RelationshipRequest,
};
