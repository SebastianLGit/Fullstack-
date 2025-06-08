const bcrypt = require("bcrypt");

const password = "hej123";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log("Hashat lösenord:", hash);
});
