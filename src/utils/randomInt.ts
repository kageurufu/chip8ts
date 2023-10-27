export default function randomInt(max: number): number;
export default function randomInt(min: number, max: number): number;
export default function randomInt(min: number, max?: number): number {
  if (max == undefined) {
    max = min;
    min = 0;
  }

  return min + Math.floor(Math.random() * (max - min));
}
