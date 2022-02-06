const { assert, should } = require("chai");

const { getUserByEmail } = require("../helpers.js");
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};
function generateRandomString() {
  let random = Math.random().toString(36).slice(6);
  console.log(random);
  return random;
}
describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
});
should("only work on email", function () {
  const user = getUserByEmail("user2RandomID", testUsers);
  assert.notDeepEqual(user, undefined);
});
