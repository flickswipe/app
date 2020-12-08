import { AxiosResponse } from 'axios';

export default jest.fn().mockImplementation(() =>
  Promise.resolve({
    data: {
      errors: [{ message: "Mock response once to supply test response" }],
    },
    status: 400,
    statusText: "Bad Request",
    config: {},
    headers: {},
  } as AxiosResponse)
);
