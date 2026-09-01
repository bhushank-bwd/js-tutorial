let arr1: number[] = [1, 2, 3, 4, 5];
let arr2: string[] = ["1", "2", "3", "4", "5"];
let arr3: number[] | string[] = ["2", "4"];
let arr4: number[] | string[] = [2, 4];
let arr5: (number | string)[] = [1, "2", 3, "4", 5];
let arr6: Array<number> = [1, 2, 3, 4, 5];
let arr61: Array<number | string> = [1, "2", 3, "4", 5]; // undefined can also be added
let arr7: Array<string> = ["1", "2", "3", "4", "5"];
type User = {
  name: string;
  age: number;
  id?: number;
};
let arr8: User[] = [
  { name: "John", age: 20, id: 1 },
  { name: "Jane", age: 21 },
];
let arr9: Partial<User>[] = [
  { name: "John", age: 20 },
  { name: "Jane", age: 21, id: 1 },
];
let arr10: [number, string] = [1, "2"]; // tuple
let arr11: readonly number[] = [1, 2, 3, 4, 5]; // readonly array
// arr11.push(6); // error

function getTotal(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

const total = getTotal([10, 20, 30]);

console.log(total); // 60
const matrix: number[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
const data: number[][][] = [];