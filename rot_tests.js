let center = [3,3]
let a, b, c, d;

// ANGLED EDGE TESTS
a = [1,1];
b = [4,1];
c = [5,5];
d = [1,4];

console.log("----Angled edge tests----");
// in clockwise order
console.log("in clockwise order");
console.log(left(a, b));
console.log(left(b, c));
console.log(left(c, d));
console.log(left(d, a));

// in counterclockwise order
console.log("in counterclockwise order");
console.log(left(d, c));
console.log(left(c, b));
console.log(left(b, a));
console.log(left(a, d));

// ORTHOGONAL EDGES 
a = [3,1];
b = [5,3];
c = [3,5];
d = [1,3];

console.log("----Ortho edge tests----");
// in clockwise order
console.log("in clockwise order");
console.log(left(a, b));
console.log(left(b, c));
console.log(left(c, d));
console.log(left(d, a));

// in counterclockwise order
console.log("in counterclockwise order");
console.log(left(d, c));
console.log(left(c, b));
console.log(left(b, a));
console.log(left(a, d));
