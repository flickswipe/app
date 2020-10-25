/**
 * Mock environment variables
 */
beforeAll(async () => {
  process.env.RAPIDAPI_KEY = "test-rapidapi-key";
  process.env.TMDB_KEY = "test-tmdb-key";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
});
