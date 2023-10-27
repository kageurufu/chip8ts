export type Nibble = number;
export type Byte = number;
export type Word = number;
export type Address = Word;
export type Bit = number & (0 /* $ */ | 1);

export type Vx = Nibble;
export type Vy = Nibble;

/* Instruction Decoding
 * $_x__ - Vx
 * $__y_ - Vy
 * $_nnn - Addr
 * $___n - Nibble
 */

export type Instruction =
  | { op: "SYS addr"; addr: Address } /* $0nnn */
  | { op: "CLS" } /* $00E0 */
  | { op: "RET" } /* $00EE */
  | { op: "JP addr"; addr: Address } /* $1nnn */
  | { op: "CALL addr"; addr: Address } /* $2nnn */
  | { op: "SE Vx, kk"; x: Vx; kk: Byte } /* $3xkk */
  | { op: "SNE Vx, kk"; x: Vx; kk: Byte } /* $4xkk */
  | { op: "SE Vx, Vy"; x: Vx; y: Vy } /* $5xy0 */
  | { op: "LD Vx, kk"; x: Vx; kk: Byte } /* $6xkk */
  | { op: "ADD Vx, kk"; x: Vx; kk: Byte } /* $7xkk */
  | { op: "LD Vx, Vy"; x: Vx; y: Vy } /* $8xy0 */
  | { op: "OR Vx, Vy"; x: Vx; y: Vy } /* $8xy1 */
  | { op: "AND Vx, Vy"; x: Vx; y: Vy } /* $8xy2 */
  | { op: "XOR Vx, Vy"; x: Vx; y: Vy } /* $8xy3 */
  | { op: "ADD Vx, Vy"; x: Vx; y: Vy } /* $8xy4 */
  | { op: "SUB Vx, Vy"; x: Vx; y: Vy } /* $8xy5 */
  | { op: "SHR Vx{, Vy}"; x: Vx; y: Vy } /*8xy6 $ */
  | { op: "SUBN Vx, Vy"; x: Vx; y: Vy } /* $8xy7 */
  | { op: "SHL Vx{, Vy}"; x: Vx; y: Vy } /* $8xye */
  | { op: "SNE Vx, Vy"; x: Vx; y: Vy } /* $9xy0 */
  | { op: "LD I, addr"; addr: Address } /* $Annn */
  | { op: "JP Vx, addr"; x: Vx; addr: Address } /* $Bnnn / $Bxnn */
  | { op: "RND Vx, kk"; x: Vx; kk: Byte } /* $Cxkk */
  | { op: "SKP Vx"; x: Vx } /* $Ex9E */
  | { op: "SKNP Vx"; x: Vx } /* $ExA1 */
  | { op: "LD Vx, DT"; x: Vx } /* $Fx07 */
  | { op: "LD Vx, K"; x: Vx } /* $Fx0A */
  | { op: "LD DT, Vx"; x: Vx } /* $Fx15 */
  | { op: "LD ST, Vx"; x: Vx } /* $Fx18 */
  | { op: "ADD I, Vx"; x: Vx } /* $Fx1E */
  | { op: "LD F, Vx"; x: Vx } /* $Fx29 */
  | { op: "LD B, Vx"; x: Vx } /* $Fx33 */
  | { op: "LD [I], Vx"; x: Vx } /* $Fx55 */
  | { op: "LD Vx, [I]"; x: Vx } /* $Fx65 */
  | { op: "DRW Vx, Vy, n"; x: Vx; y: Vy; n: Nibble } /* $Dxyn */

  // super-chip8 1.1
  | { op: "SCD n"; n: Nibble } /* $00Cn */
  | { op: "SCR" } /* $00FB */
  | { op: "SCL" } /* $00FC */
  | { op: "EXIT" } /* $00FD */
  | { op: "LORES" } /* $00FE */
  | { op: "HIRES" } /* $00FF */
  | { op: "DRW16 Vx, Vy"; x: Vx; y: Vy } /* $Dxy0 */
  | { op: "LD HF, Vx"; x: Vx } /* $Fx30 */
  | { op: "SAVE Vx"; x: Vx } /* $Fx75 */
  | { op: "LOAD Vx"; x: Vx }; /* $Fx85 */
