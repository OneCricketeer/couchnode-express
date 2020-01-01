var _ = require('lodash');
var router = require('express').Router();
var beerCtrl = require('../controllers/cb_beer_ctrl');

/* GET home page. */
function list_beers(req, res) {
  beerCtrl.listBeers(function(err, result) {
    if (err) {
      res.status(500).send(err);
    }
    res.render('beer/index', {
      beers: result
    });
  });
};

function search_beer(req, res) {
  var token = req.query.value;
  beerCtrl.searchBeer(token, function (err, results) {
    if (err) {
      res.status(500).send(err);
    }
    res.send(results);
  });
};

function delete_beer(req, res) {
  var beer_id = req.params.beer_id;
  beerCtrl.deleteBeer(beer_id, function(err, result) {
    if( err ) {
        console.log( 'Unable to delete document `' + beer_id + '`' );
      } else {
        console.log('Deleted ' + beer_id);
      }

      res.redirect('/');
  });
};

function begin_create_beer(req, res) {
  var view = {
    is_create: true,
    beer: {
      type: '',
      name: '',
      description: '',
      style: '',
      category: '',
      abv: '',
      ibu: '',
      srm: '',
      upc: '',
      brewery_id: ''
    }
  };
  res.render('beer/edit', view);
};

function begin_edit_beer(req, res) {
  var doc_id = req.params.beer_id;
  beerCtrl.findBeerById(doc_id, function(err, result) {
    if (err) {
      res.status(500).send(err);
    }
  //   else if(!result || result.value === undefined ) { // Trying to edit non-existing doc ?
  //     res.send(404);
  //   }
     else { // render form.
      result.id = doc_id;
      var view = {
        is_create: false,
        beer: result
      };
      // res.send(result);
      res.render('beer/edit', view);
    }
  });
};

function done_edit_beer(req, res) {
  var beer_id = req.params.beer_id;
  beerCtrl.updateBeer(beer_id, req.body, function (err, result) {
    if (err) {
      res.status(500).send(err);
    }
    res.redirect('/beers/show/'+beer_id);
  });
};

function done_create_beer(req, res) {
  beerCtrl.addBeer(req.body, function (err, result) {
    if (err) {
      res.status(500).send(err);
    }
    res.redirect('/beers/show/'+result);
  });
};

function show_beer(req, res) {
  beerCtrl.findBeerById(req.params.beer_id, function(err, result) {
    if (err) {
      res.status(500).send(err);
    }
    var view = {
      beer: result,
      beerfields: _.map(result, function(v, k) {
        return {
          key: k,
          value: v
        }
      })
    };
    res.render('beer/show', view);
  });
};

// Rendered Pages
router.get('/', list_beers);
router.get('/create', begin_create_beer);
router.get('/show/:beer_id', show_beer);
router.get('/edit/:beer_id', begin_edit_beer);

// API Functions
router.get('/search', search_beer);

// Redirects
router.post('/create', done_create_beer);
router.post('/edit/:beer_id', done_edit_beer);
router.get('/delete/:beer_id', delete_beer);

module.exports = router;
