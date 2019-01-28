const express = require('express')
var router = express.Router()

// google oauth setup
const { google } = require("googleapis")

oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://127.0.0.1:3000/admin/login/callback"
);

const oauth2Scopes = [
  'https://www.googleapis.com/auth/plus.me'
];

const oauth2Url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: oauth2Scopes
});

oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    // store the refresh_token in my database!
    console.log(tokens.refresh_token);
  }
  console.log(tokens.access_token);
});

// redirect to Google oauth
router.get("/login", (req, res, next) => {
  //res.render("public/admin/login", {})
  //res.send("preparing to redirect")
  res.redirect(oauth2Url)
})

router.get("/login/callback", async (req, res, next) => {
  res.send("Hola")
  console.log(req)
  const {tokens} = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens);

  console.log(tokens)
})

// Check if user is logged in
router.use((req, res, next) => {
  res.send("This is the admin page")
})

module.exports = router;
