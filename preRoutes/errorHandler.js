const fs = require('fs');

const express = require('express');
let router = express.Router();

//Try to find the file in views/public
router.use(function(req, res, next) {
  let splitPath = req.url.split("");
  splitPath.splice(0, 1);
  let pathString = splitPath.join("").split("?")[0];

  if(splitPath[splitPath.length - 1] === "/" || splitPath.length === 0) {
    pathString += "index";
  }

  fs.access("views/public/" + pathString + ".hbs", fs.R_OK, function(err) {
    if(err) {
      next();
    } else {
      res.render("public/" + pathString, {});
    }
  });
});

//set status to 404:Not found
router.use(function(req, res, next) {
  next({
    status: 404,
    msg: "Not found",
    log: false
  });
});

router.use(function(err, req, res, next) {
  if(err) {
    //log the error to the console
    if(err.log != false) {
      console.error(err);
    }
    //render an error page
    res.render("stats/" + err.status, {});
  } else {
    //thor error - however I don't this this will be thrown.
    throw new Error("An error wasn't chaught!");
  }
});

module.exports = router;
