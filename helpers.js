const getUserByEmail = function (email,dB) {
  const uservalues = Object.values(dB);

  for (const user of uservalues) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

function generateRandomString() {
  let random = Math.random().toString(36).slice(6);
  console.log(random);
  return random;
}
module.exports = { getUserByEmail, generateRandomString };
