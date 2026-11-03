/**
 * ヒーローのドットジオラマのボクセル定義。
 * Minecraft 風の「ブロックで組んだ家と、正面を向いて座るねこ」。
 *
 * 座標系: x=横, y=高さ(上が+), z=奥行き(手前が 0)。1 グリッド = 1 ドット。
 * 範囲: x 0..25 / y 0..13 / z 0..15
 */

export type DioramaColor = "floor" | "wall" | "roof" | "cat" | "accent";
export type Voxel = [number, number, number, DioramaColor];

export function buildDiorama(): Voxel[] {
  // Map なので同じセルは上書きされ、ドットが重複しない
  const cells = new Map<string, DioramaColor>();
  const add = (x: number, y: number, z: number, c: DioramaColor) =>
    cells.set(`${x},${y},${z}`, c);
  const box = (
    x0: number,
    y0: number,
    z0: number,
    w: number,
    h: number,
    d: number,
    c: DioramaColor,
  ) => {
    for (let x = x0; x < x0 + w; x++) {
      for (let y = y0; y < y0 + h; y++) {
        for (let z = z0; z < z0 + d; z++) add(x, y, z, c);
      }
    }
  };

  // 地面(厚み 2 の土台)
  box(0, 0, 0, 26, 2, 16, "floor");

  // 家(壁厚 2。正面にドアと窓)
  box(5, 2, 5, 5, 7, 2, "wall"); // 正面の壁・ドアの左
  box(12, 2, 5, 6, 7, 2, "wall"); // 正面の壁・ドアの右
  box(10, 6, 5, 2, 2, 2, "wall"); // ドアの上のまぐさ
  box(5, 2, 13, 13, 7, 2, "wall"); // 背面の壁
  box(5, 2, 7, 2, 7, 6, "wall"); // 左の壁
  box(16, 2, 7, 2, 7, 6, "wall"); // 右の壁
  box(7, 4, 5, 1, 2, 2, "accent"); // 窓(左)
  box(14, 4, 5, 1, 2, 2, "accent"); // 窓(右)

  // 切妻屋根(中まで詰まった三角形)+ 棟の縁取り
  for (let x = 4; x <= 18; x++) {
    for (let z = 4; z <= 15; z++) {
      const top = 13 - Math.round((4 / 5) * Math.abs(z - 9.5));
      for (let y = 8; y <= top; y++) {
        const ridge = y === 13 && (z === 9 || z === 10);
        add(x, y, z, ridge ? "accent" : "roof");
      }
    }
  }
  // 煙突
  box(14, 10, 6, 2, 4, 2, "wall");

  // ねこ(正面を向いて座っている)
  box(17, 2, 0, 5, 4, 3, "cat"); // 胴体
  box(18, 5, 0, 3, 3, 3, "cat"); // 頭
  box(17, 7, 0, 1, 2, 2, "cat"); // 左耳
  box(21, 7, 0, 1, 2, 2, "cat"); // 右耳
  add(18, 6, 0, "accent"); // 目(左)
  add(20, 6, 0, "accent"); // 目(右)
  // しっぽ(S 字に立てる)
  add(16, 2, 1, "cat");
  add(15, 3, 1, "cat");
  add(15, 4, 1, "cat");
  add(16, 5, 1, "cat");
  add(17, 6, 1, "cat");

  // 毛糸玉 + ほどけた糸
  box(23, 2, 2, 2, 2, 2, "accent");
  add(22, 2, 2, "accent");

  // ハート(ねこの頭上)
  const heart: Array<[number, number]> = [
    [18, 9], [20, 9],
    [17, 10], [18, 10], [19, 10], [20, 10], [21, 10],
    [18, 11], [19, 11], [20, 11],
    [19, 12],
  ];
  for (const [hx, hy] of heart) add(hx, hy, 1, "accent");

  return [...cells.entries()].map(([key, color]) => {
    const [x, y, z] = key.split(",").map(Number);
    return [x, y, z, color];
  });
}
