var logger = require( 'pelias-logger' ).get( 'bikes-pelias' );
/**
 * @file entry for the gtfs stop import pipeline
 */

var importPipeline = require( './lib/importPipeline' );
if (process.argv.length>2) {
  importPipeline.create(process.argv[2]);
} else {
  logger.error('Data source address missing');
  process.exit(1);
}
