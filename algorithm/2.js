const longest = (str) => {
  let nChar = 0;
  let longestWord = '';
  const words = str.split(' ');

  for (const word of words) {
    if (word.length > nChar) {
      nChar = word.length;
      longestWord = word;
    }
  }

  console.log(`${longestWord}: ${nChar}`);
};

longest('Saya sangat senang mengerjakan soal algoritma');
