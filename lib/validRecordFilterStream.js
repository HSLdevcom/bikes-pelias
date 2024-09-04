var through = require( 'through2' );
var logger = require( 'pelias-logger' ).get( 'bikes-pelias' );

function isValidRecord( record ) {
  if (record.rentalNetwork.networkId === 'bolt_helsinki') {
    return false;
  }
  return ['name', 'lat', 'lon'].every(function(prop) {
    return record[prop] !== undefined;
  });
}

/*
 * filter out invalid records
 */
function createValidRecordFilterStream() {
  var invalidCount = 0;

  return through.obj(function( record, enc, next ) {
    if (isValidRecord(record)) {
      this.push(record);
    } else {
      invalidCount++;
    }
    next();
  }, function(next) {
    logger.verbose('Skipped invalid records: ' + invalidCount);
    next();
  });
}

module.exports = {
  create: createValidRecordFilterStream
};
