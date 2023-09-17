const frequency = (input, query) => {
  const inputFreq = input.reduce((acc, curr) => {
    if (acc[curr]) acc[curr] += 1;
    else acc[curr] = 1;

    return acc;
  }, {});

  let freq = [];
  for (const q of query) {
    freq.push(inputFreq[q] ? inputFreq[q] : 0);
  }

  return freq;
};

let INPUT = ['xc', 'dz', 'bbb', 'dz'];
let QUERY = ['bbb', 'ac', 'dz'];

console.log(frequency(INPUT, QUERY));
