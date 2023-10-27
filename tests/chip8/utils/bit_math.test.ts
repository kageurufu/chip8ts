import { describe, expect, test } from "bun:test";

import {
  word,
  word_hi,
  word_lo,
  nib_hi,
  nib_lo,
  op_x,
  op_y,
  op_addr,
  op_kk,
  op_n,
  bcd,
} from "../../../src/utils/bit_math";

describe("bit_math", () => {
  test("word", () => {
    expect(word(0x12, 0x34)).toEqual(0x1234);
  });

  test("word_hi", () => {
    expect(word_hi(0x1234)).toEqual(0x12);
  });

  test("word_lo", () => {
    expect(word_lo(0x1234)).toEqual(0x34);
  });

  test("nib_hi", () => {
    expect(nib_hi(0x12)).toEqual(0x1);
  });

  test("nib_lo", () => {
    expect(nib_lo(0x12)).toEqual(0x2);
  });

  test("op_x", () => {
    expect(op_x(0x12, 0x34)).toEqual(0x2);
  });

  test("op_y", () => {
    expect(op_y(0x12, 0x34)).toEqual(0x3);
  });

  test("op_addr", () => {
    expect(op_addr(0x12, 0x34)).toEqual(0x234);
  });

  test("op_kk", () => {
    expect(op_kk(0x12, 0x34)).toEqual(0x34);
  });

  test("op_n", () => {
    expect(op_n(0x12, 0x34)).toEqual(0x4);
  });

  test("bcd", () => {
    expect(bcd(123)).toEqual([1, 2, 3]);
  });
});
