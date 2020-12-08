import mongoose, { Schema } from 'mongoose';

import { AnySetting } from '@flickswipe/common';

/**
 * Properties used to create a Setting
 */
type SettingAttrs = Omit<AnySetting, "updatedAt">;

/**
 * Properties that a Setting document has
 */
type SettingDoc = SettingAttrs & {
  createdAt: Date;
  updatedAt: Date;
} & mongoose.Document;

/**
 * Setting mongoose schema
 */
const settingSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    settingType: {
      type: String,
      required: true,
    },
    value: {
      type: Object,
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
 * Build wrapper (used to enforce SettingAttrs)
 */
interface SettingModel extends mongoose.Model<SettingDoc> {
  build(attrs: SettingAttrs): SettingDoc;
}

settingSchema.statics.build = (attrs: SettingAttrs) => {
  return new Setting(attrs);
};

/**
 * Initialize model
 */
const Setting = mongoose.model<SettingDoc, SettingModel>(
  "Setting",
  settingSchema
);

/**
 * Exports
 */
export { SettingAttrs, SettingModel, SettingDoc, Setting };
