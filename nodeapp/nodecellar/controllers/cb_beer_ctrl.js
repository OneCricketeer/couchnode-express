var _ = require('lodash');

var couchbase = require("./couchbase");
var ViewQuery = couchbase.ViewQuery;
var db = couchbase.beer_bucket;

var ENTRIES_PER_PAGE = 30;

/** Private Methods **/
function normalize_beer_fields(data) {
  var doc = {};
  _.each(data, function(value, key) {
    if (key.substr(0, 4) == 'beer') {
      doc[key.substr(5)] = value;
    }
  });

  if (!doc['name']) {
    throw new Error('Beer must have name!');
  }
  if (!doc['brewery_id']) {
    throw new Error('Beer must have brewery ID!');
  }

  return doc;
};

/** Public Methods **/
var beer_ctrl = module.exports = {
  listBeers: function(cb) {
    var q = ViewQuery.from('beer', 'by_name')
      .stale(ViewQuery.Update.BEFORE)
      .limit(ENTRIES_PER_PAGE);

    db.query(q, function(err, values) {
      var keys = _.pluck(values, 'id');

      db.getMulti(keys, function(err, results) {
        var beers = _.map(results, function(v, k) {
          v.value.id = k;
          return v.value;
        });

        cb(null, beers);
      });
    });
  },
  findBeerById: function(beer_id, cb) {
    db.get(beer_id, function(err, result) {
      if (err) {
        cb(err, null);
      }
      if (!result || result.value === undefined) {
        cb({
          'status': 'error',
          'message': 'The requested id does not exist'
        }, null);
      } else {
        var doc = result.value;
        doc.id = beer_id;

        cb(null, doc);
      }
    });
  },
  addBeer: function(beer_req_body, cb) {
    var doc = normalize_beer_fields(beer_req_body);
    var beer_id = doc.brewery_id.toLowerCase() + '-' + doc.name.replace(' ', '_').toLowerCase();
    db.insert(beer_id, doc, function(err, result) {
      if (err) {
        cb(err, null);
      } else {
        console.log('Added ' + beer_id);
        cb(null, beer_id);
      }
    });
  },
  updateBeer: function(beer_id, beer_req_body, cb) {
    var doc = normalize_beer_fields(beer_req_body);

    db.get(doc.brewery_id, function(err, result) {
      if (err) {
        cb(err, null);
      } else if (result.value === undefined) {
        cb({
          'status': 'error',
          'message': 'The requested id does not exist'
        }, null);
      } else {
        db.upsert(beer_id, doc, function(err, doc, meta) {
          console.log('Updated ' + beer_id);
          cb(null, doc);
        });
      }
    });
  },
  deleteBeer: function(doc_id, cb) {
    couchbase.deleteObject(db, doc_id, function(err, result) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, result);
      }
    });
  },
  searchBeer: function(token, cb) {
    var q = ViewQuery.from('beer', 'by_name')
      .range(token, token + JSON.parse('"\u0FFF"'))
      .stale(ViewQuery.Update.BEFORE)
      .limit(ENTRIES_PER_PAGE);

    db.query(q, function(err, values) {
      var keys = _.pluck(values, 'id');
      if (keys.length <= 0) {
        return cb(null, []);
      }
      db.getMulti(keys, function(err, results) {
        var beers = [];
        for (var k in results) {
          beers.push({
            'id': k,
            'name': results[k].value.name,
            'brewery_id': results[k].value.brewery_id
          });
        }

        cb(null, beers);
      });
    });
  }
}
