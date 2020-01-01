var router = require('express').Router();
var beers = require('./api/beers');
router.use('/beer', beers);
module.exports = router;
