function square(numA: number): number {
  return numA * numA;
}
type User = { name: string; age: number };

function display(user: User): string {
  return `${user.name} => Happy ${user.age} Birthday!`;
}
function throwError(message: string): never {
  // never that throws error
  throw new Error(message);
}
console.log(square(21));
let u: User = {
  name: "Jane",
  age: 32,
};
let u1 = {
  name: "Michel",
  age: 15,
  sports: "Football",
};
console.log(display({ name: "John", age: 25 }), display(u), display(u1)); // extra can pass trough object

type Student = {
  readonly id: number;
  name: string;
  age: number;
  isPaid?: boolean;
};
function displayStudent(student: Student): string {
  return `${student.name} => Happy ${student.age} Birthday! ${student.isPaid ? "Thank You for enrollment" : "Please pay tuition fee as soon as possible"}`;
}
let s1: Student = {
  id: 5,
  name: "Jessica",
  age: 32,
};
// s1.id = 44; gives error or warning
s1.name = s1.name.toLocaleUpperCase();
console.log(s1);
console.log(displayStudent({ id: 1, name: "Pramod", age: 45 }));
console.log(displayStudent({ id: 1, name: "devraj", age: 45, isPaid: true }));
// throwError("return never if function throws error");
type CardDate = {
  cvv: number | string; // or/union
};
type CardDetail = {
  name: string;
  expDate: string;
};
type Card = CardDate & CardDetail & { brand: string }; // and

let c1: Card = {
  cvv: 116,
  name: "John Doe",
  expDate: "2029-12",
  brand: "VISA",
};
let c2: Card = {
  cvv: "116AB",
  name: "John Doe",
  expDate: "2029-12",
  brand: "VISA",
};
function displayCard(card: Card): string {
  let cardCvv =
    typeof card.cvv == "string" ? card.cvv.toLocaleLowerCase() : card.cvv;
  return `${card.name}-${cardCvv}`;
}
console.log(displayCard(c1))
console.log(displayCard(c2))
let pi:3.14 = 3.14 // only specific value