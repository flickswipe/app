import mongoose from 'mongoose';

import { EmailTokenType } from '@flickswipe/common';

import { UserDoc } from './user';

/**
 * Properties used to create a EmailToken
 */
interface EmailTokenAttrs {
  emailTokenType: EmailTokenType;
  user: string;
  userAgent: string;
  token: string;
  url: string;
  payload: {
    email: string;
  } | null;
  expiresAt: Date;
}

/**
 * Properties that a EmailToken document has
 */
interface EmailTokenDoc extends mongoose.Document {
  emailTokenType: EmailTokenType;
  user: mongoose.Types.ObjectId | UserDoc;
  userAgent: string;
  token: string;
  url: string;
  payload: {
    email: string;
  } | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * EmailToken mongoose schema
 */
const emailTokenSchema = new mongoose.Schema(
  {
    emailTokenType: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    payload: {
      type: Object,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = `${ret._id}`;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

/**
 * Build wrapper (used to enforce EmailTokenAttrs)
 */
interface EmailTokenModel extends mongoose.Model<EmailTokenDoc> {
  build(attrs: EmailTokenAttrs): EmailTokenDoc;
}

emailTokenSchema.statics.build = (attrs: EmailTokenAttrs) => {
  return new EmailToken(attrs);
};

/**
 * Initialize model
 */
const EmailToken = mongoose.model<EmailTokenDoc, EmailTokenModel>(
  "EmailToken",
  emailTokenSchema
);

/**
 * Exports
 */
export { EmailTokenAttrs, EmailTokenModel, EmailTokenDoc, EmailToken };
