import mongoose from "mongoose";

/**
 * Properties used to create a Country
 */
interface CountryAttrs {
  country: string;
}

/**
 * Properties that a Country document has
 */
interface CountryDoc extends mongoose.Document {
  country: string;
}

/**
 * Country mongoose schema
 */
const countrySchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
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
 * Build wrapper (used to enforce CountryAttrs)
 */
interface CountryModel extends mongoose.Model<CountryDoc> {
  build(attrs: CountryAttrs): CountryDoc;
}

countrySchema.statics.build = (attrs: CountryAttrs) => {
  return new Country(attrs);
};

/**
 * Initialize model
 */
const Country = mongoose.model<CountryDoc, CountryModel>(
  "Country",
  countrySchema
);

/**
 * Exports
 */
export { CountryAttrs, CountryModel, CountryDoc, Country };
