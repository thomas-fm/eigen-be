const matrix = (m) => {
  // assume m is valid nxn
  const n = m.length;

  let firstDiagonal = 0;
  let secondDiagonal = 0;
  const firstIdx = [0, 0];
  const secondIdx = [0, n - 1];

  for (let i = 0; i < n; i++) {
    firstDiagonal += m[i + firstIdx[0]][i + firstIdx[1]];
    secondDiagonal += m[secondIdx[0] + i][secondIdx[1] - i];
  }

  return Math.abs(firstDiagonal - secondDiagonal);
};

let mat = [
  [1, 2, 0],
  [4, 5, 6],
  [7, 8, 9],
];
console.log(matrix(mat));
