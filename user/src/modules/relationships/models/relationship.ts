import { RelationshipType } from "@flickswipe/common";
import mongoose, { Schema } from "mongoose";

/**
 * Properties used to create a Relationship
 */
interface RelationshipAttrs {
  relationshipType: RelationshipType;
  sourceUser: string;
  targetUser: string;
}

/**
 * Properties that a Relationship document has
 */
interface RelationshipDoc extends mongoose.Document {
  relationshipType: RelationshipType;
  sourceUser: string;
  targetUser: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Relationship mongoose schema
 */
const relationshipSchema = new mongoose.Schema(
  {
    relationshipType: {
      type: String,
      required: true,
    },
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
 * Build wrapper (used to enforce RelationshipAttrs)
 */
interface RelationshipModel extends mongoose.Model<RelationshipDoc> {
  build(attrs: RelationshipAttrs): RelationshipDoc;
}

relationshipSchema.statics.build = (attrs: RelationshipAttrs) => {
  return new Relationship(attrs);
};

/**
 * Initialize model
 */
const Relationship = mongoose.model<RelationshipDoc, RelationshipModel>(
  "Relationship",
  relationshipSchema
);

/**
 * Exports
 */
export { RelationshipAttrs, RelationshipModel, RelationshipDoc, Relationship };
