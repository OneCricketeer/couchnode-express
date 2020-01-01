var router = require('express').Router();
var beerCtrl = require('../../controllers/cb_beer_ctrl');

function genericHandler(err, result, resp) {
  if (err) {
    resp.status(500).send(err);
  }
  resp.send(result);
};

router.get('/', function (req, res) {
  beerCtrl.listBeers(function (err, result) {
    genericHandler(err, result, res);
  });
});

router.get('/:id', function(req, res) {
  beerCtrl.findBeerById(req.params.id, function(err, result) {
    genericHandler(err, result, res);
  });
});

router.post('/', function (req, res) {
  beerCtrl.addBeer(req.body);
});

router.put('/:id', function (req, res) {
  var beer_id = req.params.id;
  beerCtrl.updateBeer(beer_id, req.body);
});

router.delete('/:id', function(req, res) {
  beerCtrl.deleteBeer(req.params.id);
});

module.exports = router;
