'use strict';

const express = require('express');
//const commandLineArgs = require('command-line-args');
const mongoClient = require('mongodb').MongoClient;
const mongoDbName = 'test';
const mongoCollectionName = 'newBaseballData'
const app = express();

//const cli = commandLineArgs([
//  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
//  { name: 'port',    alias: 'p', type: Number,  defaultValue: 8081  },
//  { name: 'report',  alias: 'r', type: Boolean, defaultValue: false }
//]);
let options = {
  port: 8081
};

app.verbose = false;
app.report = false;

module.exports = app;

app.use( require('body-parser').json() );

app.options('*', (req, res) => {
  setHeaders(res);

  res.status(200).json({});
});

app.get('/data', (req, res) => {
  setHeaders(res);

  getMongoData(function(results) {
    res.status( 200 ).send(results);
  });

});

app.listen(options.port, () => {
  console.log('Peripheral mocker listening on port ' + options.port);
});

function setHeaders(res) {
  if (! res.headersSent) {
    res.set('Access-Control-Allow-Headers', 'accept, api-user-name, client-id, nonce, signature, signature-datetime, tenant_id, content-type');
    res.set('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE');
    res.set('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'text/json');
  }
}

function getMongoData(callback) {
  mongoClient.connect(`mongodb://localhost:27017/${mongoDbName}`, (err, db) => {
    if (!err) {
      console.log('We are connected');
      let collection = db.collection(mongoCollectionName);

      collection.find().toArray((err, docs) => {
        db.close();
        callback(docs);
      })
    } else {
      console.log('failed to connect');
    }
  });
}