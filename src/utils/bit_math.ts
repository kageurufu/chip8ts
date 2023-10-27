import { Vx, Vy, Address, Byte, Nibble, Word, Bit } from "../types";

export const word = (hi: Byte, lo: Byte): Word => (hi << 8) + lo;
export const word_hi = (w: Word): Byte => (w >> 8) & 0xff;
export const word_lo = (w: Word): Byte => w & 0xff;

export function mask<T extends number = Word>(v: T, mask: T) {
  return v & mask;
}

export const nib_hi = (byte: Byte): Nibble => (byte & 0xf0) >> 4;
export const nib_lo = (byte: Byte): Nibble => byte & 0x0f;

export const op_x = (hi: Byte, lo: Byte): Vx =>
  (((hi << 8) | lo) & 0x0f00) >> 8;
export const op_y = (hi: Byte, lo: Byte): Vy =>
  (((hi << 8) | lo) & 0x00f0) >> 4;
export const op_addr = (hi: Byte, lo: Byte): Address =>
  ((hi << 8) | lo) & 0x0fff;
export const op_kk = (hi: Byte, lo: Byte): Byte => lo;
export const op_n = (hi: Byte, lo: Byte): Nibble => lo & 0x0f;

export const bcd = (byte: Byte): [Byte, Byte, Byte] => [
  Math.floor(byte / 100) % 10,
  Math.floor(byte / 10) % 10,
  Math.floor(byte / 1) % 10,
];
