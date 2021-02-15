var logger = require( 'pelias-logger' ).get( 'bikes-pelias' );
var axios = require('axios');
var ValidRecordFilterStream = require('./validRecordFilterStream');
var DocumentStream = require('./documentStream');
var AdminLookupStream = require('pelias-wof-admin-lookup');
var model = require( 'pelias-model' );
var JSONStream = require('JSONStream');
var peliasDbclient = require( 'pelias-dbclient' );

/**
 * Import otp bike stations into Pelias elasticsearch.
 *
 * @param url OTP address
 *
 */

function createImportPipeline(url) {
  logger.info( 'Importing bike stations from ' + url );

  var validRecordFilterStream = ValidRecordFilterStream.create();
  var documentStream = DocumentStream.create();
  var adminLookupStream = AdminLookupStream.create();
  var dbWriter = peliasDbclient({});

  axios({
    method: 'post',
    url: url,
    headers: { 'Content-Type': 'application/graphql'},
    data: '{ bikeRentalStations {id name networks lat lon} }',
    responseType:'stream'
  }).then(function(res) {
    res.data.pipe(JSONStream.parse('data.bikeRentalStations.*'))
      .pipe( validRecordFilterStream )
      .pipe( documentStream )
      .pipe( adminLookupStream )
      .pipe( model.createDocumentMapperStream() )
      .pipe( dbWriter );
  }).catch(function () { logger.error('failed'); });
}

module.exports = {
  create: createImportPipeline
};
