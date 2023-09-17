const reverseString = (str) => {
  const reverse = str.split('').reverse();
  const num = reverse[0];
  reverse.shift();
  reverse.push(num);

  return reverse.join('');
};

console.log(reverseString('EIGEN1'));
