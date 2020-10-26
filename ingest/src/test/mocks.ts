/**
 * Mock modules
 */

// mocked in __mocks__
jest.mock("axios");
jest.mock("../nats-wrapper");

beforeEach(async () => {
  jest.clearAllMocks();
});
