'use strict';

const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const mongoDbName = 'test';
const eventsCollectionName = 'events';
const tpsCollectionName = 'ticketPriceSnapshots';
const app = express();

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

app.get('/events', (req, res) => {
  setHeaders(res);

  getEvents(function(results) {
    res.status( 200 ).send(results);
  });

});

app.get('/events/:eventId', (req, res) => {
  setHeaders(res);

  getEventById(req.params.eventId, (results) => {
    res.status( 200 ).send(results);
  });
});

app.get('/tps/:eventId', (req, res) => {
  setHeaders(res);

  getTpsByEventId(req.params.eventId, (results) => {
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

function mongoQuery(collectionName, query, callback) {
  mongoClient.connect(`mongodb://localhost:27017/${mongoDbName}`, (err, db) => {
    if (!err) {
      let collection = db.collection(collectionName);

      collection.find(query).toArray( (err, doc) => {
        db.close();
        callback(doc);
      });
    } else {
      console.log('failed to connect');
    }
  });
}

function getTpsByEventId(eventId, callback) {
  mongoQuery(tpsCollectionName, {'id': Number(eventId)}, callback);
}

function getEvents(callback) {
  mongoQuery(eventsCollectionName, {}, callback);
}

function getEventById(id, callback) {
  mongoQuery(eventsCollectionName, {'id': Number(id)}, callback);
}
