export const listAllSettings = jest.fn().mockResolvedValue({
  genres: {},
  languages: {},
  rating: {},
  releaseDate: {},
  runtime: {},
  streamLocations: {},
});
export const updateGenres = jest.fn().mockResolvedValue(null);
export const updateLanguages = jest.fn().mockResolvedValue(null);
export const updateRating = jest.fn().mockResolvedValue(null);
export const updateReleaseDate = jest.fn().mockResolvedValue(null);
export const updateRuntime = jest.fn().mockResolvedValue(null);
export const updateStreamLocations = jest.fn().mockResolvedValue(null);
