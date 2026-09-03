type Address = {
  city: string;
  state: string;
};
type Scores = {
  [key: string]: number;
};
type Status = "pending" | "approved" | "rejected";
type User = {
  readonly id: number;
  name: string;
  email: string;
  age: number;
  skill: string[];
  res_address: {
    city: string;
    state: string;
  };
  status: Status;
  address: Address;
  score?: Scores;
  addressText(): string;
  display: () => string;
};
type UserKeys = keyof User;
let user: User = {
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
