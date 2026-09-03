"use strict";
let user = {
    id: 1,
    name: "John Doe",
    email: "jd@mail.com",
    age: 15,
    skill: ["JS", "React"],
    address: { city: "Kolhapur", state: "Maharashtra" },
    res_address: { city: "Kolhapur", state: "Maharashtra" },
    status: "approved",
    score: {
        math: 45,
    },
    addressText: function () {
        return `${this.address.city} ${this.address.state}`;
    },
    display: function () {
        return `${this.name} ${this.email} with score of math ${this.score?.math}`;
    },
};
console.log(user.display());
// console.log(UserKeys)
