import { AudioLanguagesSetting } from "@flickswipe/common";

export const defaultSettings = {
  country: "",
  genres: {},
  audioLanguages: { en: true } as AudioLanguagesSetting["value"],
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
