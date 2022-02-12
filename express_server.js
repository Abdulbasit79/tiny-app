const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-Session");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: "session", secret: "notsosecretsession" }));

app.set("view engine", "ejs");

const { getUserByEmail, generateRandomString} = require('./helpers');

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
    if (req.session.userID) {
      res.redirect("/urls");
  
    } else {
    res.redirect("/login");
    }
  });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session.userID;
  if(!req.session.userID) {
    res.send("<html><body>please login</body></html>\n");
  
  } else {

  
  const templateVars = {
    urls: Object.values(urlDatabase).filter((url) => url.userId === userId),
    user: users[userId],
  };
  res.render("urls_index", templateVars);
}

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    res.send(
      "It appears that URL does not exist. Consider checking My URLs again or making a tinyURL for that website!"
    );
  } else {
    const longURL = urlDatabase[req.params.shortURL].longUrl;

    res.redirect(longURL);
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("req.session.userID", req.session.userID);
  console.log("urldatabase", urlDatabase);

  const userID = req.session.userID;
  let urlObj = urlDatabase[req.params.shortURL];

  if (!urlObj) {
    res.status(401).send("Please <a href= '/login'>login</a>");
    return;
  }

  if (userID !== urlObj.userId) {
    res.status(403).send("You are not the owner of this shortURL");
    return;
  }
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});
app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;

  if (!userId) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/new", (req, res) => {
  const userId = req.session.userID;

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
  console.log(req)
  const userId = req.session.userID;
 if (!req.session.userID) {
  res.send("<html><body>restricted you do not have access please login</body></html>\n");

 } else {  console.log(req.session.userID,"req.session.userID")
 console.log(urlDatabase[req.params.shortURL],"urlDatabase[req.params.shortURL]")
  console.log(req.params.shortURL,"req.params.shortURL")
 console.log(urlDatabase,"urlDatabase")
  if(req.session.userID === urlDatabase[req.params.shortURL].userId) {
    const long = urlDatabase[req.params.shortURL];
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: long,
      user: users[userId],
    };
    res.render("urls_show", templateVars);
   
  }
  else {
    res.send("<html><body>restricted you do not have access</body></html>\n");

  }
}
 

});


app.get("/register", function (req, res) {
  if (req.session.userID) {
    return res.redirect("/urls");
  }

  res.render("register");
});
app.get("/login", (req, res) => {
  if (req.session.userID) {
    return res.redirect("/urls");
  }
  res.render("login");
});

app.post("/register", function (req, res) {
  console.log(users)
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password);
  let userID = generateRandomString();
  const user = getUserByEmail(email, users);
  if (!email || (email === "" && !password) || password === "") {
    res.status(400).send("email and password can't be blank");
    return;
  }
  let match = false;
  for (let i in users) {
    if (users[i].email === email) {
      match = true;
    }
  }

  if (match) {
    res.status(400).send("email already exist");
    return;
  }
    users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword,
  };
  req.session.userID = userID;
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longUrl = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(username, users);
 
  
  if (!user) {
    return res.status(403).send("you have entered a user does not exist");
  }

  if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(403).send("You have the wrong password");
    } else {
      req.session.userID = user.id;
      res.redirect("/urls");
      return;
    }
  }
 }); 

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
