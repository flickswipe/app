export const getSettings = jest.fn().mockResolvedValue({
  country: "",
  genres: {},
  audioLanguages: {},
  rating: {},
  releaseDate: {},
  runtime: {},
  streamLocations: {},
});
export const updateCountry = jest.fn().mockResolvedValue(null);
export const updateGenres = jest.fn().mockResolvedValue(null);
export const updateAudioLanguages = jest.fn().mockResolvedValue(null);
export const updateRating = jest.fn().mockResolvedValue(null);
export const updateReleaseDate = jest.fn().mockResolvedValue(null);
export const updateRuntime = jest.fn().mockResolvedValue(null);
export const updateStreamLocations = jest.fn().mockResolvedValue(null);
