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
const sql = require('mssql')

const config = {
    user: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE/*,
    dialect: "mssql",
    dialectOptions: {
        instanceName: "SQLEXPRESS"
    }*/
}

async () => {
    try {
        let pool = await sql.connect(`mssql://${config.user}:${config.password}@${config.server}/${config.database}`)
        const result = await pool.Request().query('SELECT * from Users')
        console.log("---")
        console.dir(result)
    } catch (err) {
        console.log(err)
    }
}

/*sql.connect(config, err => {
    // ... error checks
    if (err) console.log(err)

    // Query
    new sql.Request().query('SELECT * FROM Users', (err, result) => {
        if (err) console.log(err)

        console.dir(result)
    })

    // https://www.google.com/search?num=20&safe=active&client=firefox-b-d&biw=1536&bih=750&ei=tZ5hXOmYDIn6qwHri7KoBw&q=bigint+data+type+size&oq=bigint+data+type+size&gs_l=psy-ab.3..0i30j0i5i30j0i8i30.2012.2012..2813...0.0..0.96.96.1......0....1..gws-wiz.......0i71.Ac23pbJ7Cg8
})*/

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
