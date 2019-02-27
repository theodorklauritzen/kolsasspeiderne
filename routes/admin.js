const express = require('express')
var router = express.Router()

// google oauth setup
const { google } = require("googleapis")

oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `http://${process.env.DOMAIN}/admin/login/google/callback`
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
    //console.log("rt: ---------")
    //console.log(tokens.refresh_token);
  }
  //console.log("at: ---------")
  //console.log(tokens.access_token);
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

const pool = sql.connect(config, err => {
    // ... error checks
    if (err) console.log(err)
    else console.log("Successfully connected to the sql server")
})


// redirect to Google oauth
router.get("/login", (req, res, next) => {
  res.redirect("/admin/login/google")
})

router.get("/login/google", (req, res, next) => {
  res.redirect(oauth2Url)
})

router.get("/login/google/callback", async (req, res, next) => {
  const {tokens} = await oauth2Client.getToken(req.query.code)
  oauth2Client.setCredentials(tokens)

  //console.log(tokens)

  var oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  })
  oauth2.userinfo.get((err, gRes) => {
    if (err) {
      console.log(err)
    } else {
      //console.log(res.data)

      new sql.Request().query('SELECT ID FROM Users WHERE googleID = \'' + gRes.data.id + '\'', (err, result) => {
          if (err) console.log(err)

          if(result.recordset.length > 0) {
            res.redirect("/admin/dashboard")
            req.session.userID = result.recordset[0].ID
          } else {
            let query = `INSERT INTO Users (googleID, googleRefreshToken, email, firstName, lastName, displayName) VALUES (${gRes.data.id},'${tokens.refresh_token}', '${gRes.data.email}', '${gRes.data.given_name}', '${gRes.data.family_name}', '${gRes.data.name}')`
            //console.log(query)
            new sql.Request().query(query, (err, result) => {
                if (err) console.log(err)

                new sql.Request().query(`SELECT ID FROM Users WHERE googleID = '${gRes.data.id}'`, (err, result) => {
                    if (err) console.log(err)
                    req.session.userID = result.recordset[0].ID
                })
            })
            res.redirect("/admin/newUser")

          }
      })
    }
  });
})

// Check if user is logged in
router.use((req, res, next) => {
  if(req.session) {
    // has access
    //res.send(req.session)
    next();
  } else if(req.session.userID) {
    // Not member of any role
    res.render("dynamic/admin/newuser")
  } else {
    // Not logged in
    res.render("dynamic/admin/notLoggedIn")
  }
})

router.get("/Brukere", async (req, res, next) => {
  try {
    let result = await pool.request()
      .query('SELECT ID, displayName FROM Users')
    let user = []
    for(let i = 0; i < result.recordset.length; i++) {
      let userResult = await pool.request()
        .input('ID', sql.Int, result.recordset[i].ID)
        .query('SELECT userRole FROM UserRoles WHERE userID = @ID')

      let roles = []
      for(let i = 0; i < userResult.recordset.length; i++) {
        let r = userResult.recordset[i].userRole
        switch (r) {
          case 'a':
            roles.push("admin")
            break;
          case 'b':
            roles.push("blogger")
            break;
        }
      }

      user.push({
        name: result.recordset[i].displayName,
        roles: roles
      })
    }

    res.render("public/admin/Brukere", {
      user: user
    })
  } catch (err) {
    console.log(err)
    res.render("stats/500")
  }
})

module.exports = router;
