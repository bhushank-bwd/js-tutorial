"use strict";
function square(numA) {
    return numA * numA;
}
function display(user) {
    return `${user.name} => Happy ${user.age} Birthday!`;
}
function throwError(message) {
    // never that throws error
    throw new Error(message);
}
console.log(square(21));
let u = {
    name: "Jane",
    age: 32,
};
let u1 = {
    name: "Michel",
    age: 15,
    sports: "Football",
};
console.log(display({ name: "John", age: 25 }), display(u), display(u1)); // extra can pass trough object
function displayStudent(student) {
    return `${student.name} => Happy ${student.age} Birthday! ${student.isPaid ? "Thank You for enrollment" : "Please pay tuition fee as soon as possible"}`;
}
let s1 = {
    id: 5,
    name: "Jessica",
    age: 32,
};
// s1.id = 44; gives error or warning
s1.name = s1.name.toLocaleUpperCase();
console.log(s1);
console.log(displayStudent({ id: 1, name: "Pramod", age: 45 }));
console.log(displayStudent({ id: 1, name: "devraj", age: 45, isPaid: true }));
let c1 = {
    cvv: 116,
    name: "John Doe",
    expDate: "2029-12",
    brand: "VISA",
};
let c2 = {
    cvv: "116AB",
    name: "John Doe",
    expDate: "2029-12",
    brand: "VISA",
};
function displayCard(card) {
    let cardCvv = typeof card.cvv == "string" ? card.cvv.toLocaleLowerCase() : card.cvv;
    return `${card.name}-${cardCvv}`;
}
console.log(displayCard(c1));
console.log(displayCard(c2));
