import { expect, test } from "bun:test";
import randomInt from "../../../src/utils/randomInt";

test("randomInt respects bounds", () => {
  for (let i = 0; i < 1000; i++) {
    expect(randomInt(255)).toBeWithin(0, 256);
  }
  
  for (let i = 0; i < 1000; i++) {
    expect(randomInt(10, 255)).toBeWithin(10, 256);
  }
});
