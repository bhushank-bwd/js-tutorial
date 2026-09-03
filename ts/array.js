"use strict";
let arr1 = [1, 2, 3, 4, 5];
let arr2 = ["1", "2", "3", "4", "5"];
let arr3 = ["2", "4"];
let arr4 = [2, 4];
let arr5 = [1, "2", 3, "4", 5];
let arr6 = [1, 2, 3, 4, 5];
let arr61 = [1, "2", 3, "4", 5]; // undefined can also be added
let arr7 = ["1", "2", "3", "4", "5"];
let arr8 = [
    { name: "John", age: 20, id: 1 },
    { name: "Jane", age: 21 },
];
let arr9 = [
    { name: "John", age: 20 },
    { name: "Jane", age: 21, id: 1 },
];
let arr10 = [1, "2"]; // tuple
let arr11 = [1, 2, 3, 4, 5]; // readonly array
// arr11.push(6); // error
function getTotal(numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}
const total = getTotal([10, 20, 30]);
console.log(total); // 60
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
const data = [];
