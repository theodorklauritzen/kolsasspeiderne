const express = require('express');
let router = express.Router();

router.use("/admin", require('./admin.js'));

module.exports = router;
