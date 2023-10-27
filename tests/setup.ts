import { afterEach, beforeEach, mock } from "bun:test";

const logs = [];
global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: (() => { }),
  debug: () => {},
  info: () => {},
  // warn: jest.fn(),
  // error: jest.fn(),
};

beforeEach(() => {
  logs.length = 0;
});
afterEach(() => {});
