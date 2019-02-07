const express = require('express')
var router = express.Router()

// google oauth setup
const { google } = require("googleapis")

oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://127.0.0.1:3000/admin/login/google/callback"
);

const oauth2Scopes = [
  //'https://www.googleapis.com/auth/plus.me'
  'profile',
  'email'
];

const oauth2Url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: oauth2Scopes
});

oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    // TODO: store the refresh_token in the database!
    console.log("rt: ---------")
    console.log(tokens.refresh_token);
  }
  console.log("at: ---------")
  console.log(tokens.access_token);
});

// mssql database configuration

// redirect to Google oauth
router.get("/login", (req, res, next) => {
  res.redirect("/admin/login/google")
})

router.get("/login/google", (req, res, next) => {
  res.redirect(oauth2Url)
})

router.get("/login/google/callback", async (req, res, next) => {
  res.send("Hola")
  const {tokens} = await oauth2Client.getToken(req.query.code)
  oauth2Client.setCredentials(tokens)

  //console.log(tokens)

  var oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  })
  oauth2.userinfo.get((err, res) => {
    if (err) {
      console.log(err)
    } else {
      console.log(res.data)
    }
  });
})

// Check if user is logged in
router.use((req, res, next) => {
  res.send("This is the admin page")
})

module.exports = router;
