import { LanguagesSetting } from "@flickswipe/common";

export const defaultSettings = {
  genres: {},
  languages: { en: true } as LanguagesSetting["value"],
  rating: {
    min: 7,
  },
  runtime: {
    min: 60,
    max: 180,
  },
  releaseDate: {
    min: new Date("01-01-1970"),
  },
  streamLocations: {},
};
