// A singleton controller for Couchbase

var couchbase = require("couchbase");
var cb_cfg = require('../config').couchbase;
var cluster = new couchbase.Cluster(cb_cfg.server);

var cb_connect = module.exports = {
  ViewQuery: couchbase.ViewQuery,
  cluster: cluster,
  beer_bucket: cluster.openBucket(cb_cfg.beer_bucket),
  deleteObject: function(bucket, doc_id, cb) {
    // var id = req.params.id;
    bucket.remove(doc_id, function(err, meta) {
      if (err) {
        cb({status: 'error', message: 'Unable to delete document `' + doc_id + '`'}, null);
      } else {
        cb(null, meta);
      }
    });
  }
};

cb_connect.beer_bucket.on('connect', function(err) {
  if (err) {
    console.error("Failed to connect to cluster: " + err);
    process.exit(1);
  } else {
    console.log('Couchbase Connected');
  }
});
