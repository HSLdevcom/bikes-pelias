var through = require( 'through2' );
var peliasModel = require( 'pelias-model' );
var logger = require( 'pelias-logger' ).get( 'bikes-pelias' );

/*
 * Create a stream of Documents from valid json records
 */
function createDocumentStream() {
  var badRecordCount=0;

  return through.obj(
    function write(record, enc, next){
      try {
        var name = record.name;
	var network_id = record.networks.join('-');
        var doc = new peliasModel.Document(network_id, 'bikestation', record.stationId)
          .setName('default', name)
          .setName('fi', name)
          .setCentroid({lon: record.lon, lat: record.lat})
          .setPopularity(5);
        this.push(doc);
      }
      catch (ex){
        badRecordCount++;
      }
      next();
    }, function end(done) {
      logger.info('Bad record count: ' + badRecordCount);
      done();
    }
  );
}

module.exports = {
  create: createDocumentStream
};
