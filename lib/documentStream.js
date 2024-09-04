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
	var id = record.stationId || record.name;
	var network_id = record.rentalNetwork.networkId;
        var doc = new peliasModel.Document('citybikes' + network_id, 'bikestation', id)
          .setName('default', name)
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
