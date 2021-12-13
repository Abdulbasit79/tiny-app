const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080; // default port 8080
app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
  let random = Math.random().toString(36).slice(6);
  console.log(random);
  return random;
}
const getUserByEmail = function (email) {
  const uservalues = Object.values(users);

  for (const user of uservalues) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// console.log(generateRandomString("youtube.com"));
const urlDatabase = {
  b2xVn2: {
    id: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    userId: "userRandomID",
  },
  "9sm5xK": {
    id: "9sm5xK",
    longUrl: "http://www.google.com",
    userId: "user2RandomID",
  },
};

const bodyParser = require("body-parser");
const { response } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  console.log(
    Object.values(urlDatabase).filter((url) => url.userId === userId)
  );
  const templateVars = {
    urls: Object.values(urlDatabase).filter((url) => url.userId === userId),
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[shortURL] === undefined) {
    //if they put in a shortURL that doesn't exist in our database
    res.send(
      "It appears that URL does not exist. Consider checking My URLs again or making a tinyURL for that website!"
    );
  } else {
    res.redirect(longURL);
    const longUrl = urlDatabase[shortURL].longURL;
    res.redirect(longUrl);
  }
});
app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  if (urlDatabase.hasOwnProperty(shortURL)) {
    let longURL = urlDatabase[shortURL];
    res.redirect(`${longURL}`);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:shortURL/Delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  const longUrl = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = {
    id,
    longUrl,
    userId,
  };
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL];
  let templateVars = { shortURL: req.params.shortURL, longURL: long };
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});
app.get("/register", function (req, res) {
  //("REGISTER PAGE TEST");
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }

  res.render("register");
});
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.post("/register", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || (email === "" && !password) || password === "") {
    res.status(400).send("email and password can't be blank");
    return;
  } else {
    const user = getUserByEmail(email);

    let match = false;
    for (let i in users) {
      if (users[i].email === email && users[i].password === password) {
        match = true;
      }
    }
    if (match) {
      res.status(400).send("email already exist");
      return;
    }
    let id = generateRandomString();
    console.log(`${email} ${password}`);
    console.log(match);
    users[id] = {
      id: id,
      email: email,
      password: password,
    };

    res.cookie("user_id", id);
    res.redirect("/urls");
    return;
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longUrl = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.username;
  const existUser = Object.values(users).find(
    (user) => user.email === userEmail
  );
  if (existUser) {
    res.cookie("user_id", existUser.id);
    res.redirect("/urls");
  } else {
    res.send("User not exist");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
