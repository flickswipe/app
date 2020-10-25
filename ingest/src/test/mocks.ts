import { natsWrapper } from "../nats-wrapper";

/**
 * Mock modules
 */
jest.mock("../nats-wrapper");

beforeAll(() => {
  // @ts-ignore
  natsWrapper.client = {
    publish: jest.fn().mockImplementation(async (sub, data, cb) => {
      cb();
    }),
  };
});

beforeEach(async () => {
  jest.clearAllMocks();
});
