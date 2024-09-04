var logger = require( 'pelias-logger' ).get( 'bikes-pelias' );
var axios = require('axios');
var ValidRecordFilterStream = require('./validRecordFilterStream');
var DocumentStream = require('./documentStream');
var AdminLookupStream = require('pelias-wof-admin-lookup');
var model = require( 'pelias-model' );
var JSONStream = require('JSONStream');
var peliasDbclient = require( 'pelias-dbclient');

/**
 * Import otp bike stations into Pelias elasticsearch.
 *
 * @param url OTP address
 *
 */

function createImportPipeline(url) {
  logger.info( 'Importing bike stations from ' + url );
  var adminLookupStream = AdminLookupStream.create();
  var validRecordFilterStream = ValidRecordFilterStream.create();
  var documentStream = DocumentStream.create();
  var dbWriter = peliasDbclient({ batchSize: 10 });

  axios({
    method: 'post',
    url: url,
    headers: { 'Content-Type': 'application/graphql'},
    data: '{ vehicleRentalStations {stationId name rentalNetwork { networkId } lat lon} }',
    responseType:'stream'
  }).then(function(res) {
    res.data.pipe(JSONStream.parse('data.vehicleRentalStations.*'))
      .pipe(validRecordFilterStream)
      .pipe(documentStream)
      .pipe(adminLookupStream)
      .pipe(model.createDocumentMapperStream())
      .pipe(dbWriter);
  }).catch(function () { logger.error('failed'); });
}

module.exports = {
  create: createImportPipeline
};
