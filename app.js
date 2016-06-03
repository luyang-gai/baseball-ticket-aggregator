'use strict';

const mongoClient = require('mongodb').MongoClient;
const https = require('https');

const keysToDelete = ['links', 'announce_date', 'date_tbd', 'type', 'time_tbd', 'taxonomies', 'performers', 'datetime_utc', 'created_at', 'venue', 'datetime_tbd'];
const mongoDbName = 'test';
const mongoCollectionName = 'tempData'
const seatGeekURL = 'https://api.seatgeek.com/2/events?venue.id=13';
const intervalTimer = 30 * 60 * 1000; //30 minutes

function cleanupObject(event) {
  for (var key of keysToDelete) {
    delete event[key];
  }
}

function handleJson(json) {
  mongoClient.connect(`mongodb://localhost:27017/${mongoDbName}`, (err, db) => {
    if (!err) {
      console.log('We are connected');

      let currentDate = new Date(Date.now());
      let collection = db.collection(mongoCollectionName);
      let recordsInserted = 0;

      for (var event of json.events) {
        //make sure it's a mariners home game
        //if (event.short_title.includes('at Mariners')) {
          cleanupObject(event);
          event['entryDate'] = currentDate.toDateString();
          event['entryTime'] = currentDate.toLocaleTimeString();
          collection.insert(event, (err) => {
            if (err) {
              console.log(err)
            } else {
              console.log('one collection insert event passed');
              recordsInserted++;
              if (recordsInserted === json.events.length) {
                console.log('Closing connection');
                db.close();
              }
            }
          });
        //}
      }
    } else {
      console.log('failed to connect');
    }
  });
}

function getTicketData() {
  https.get(seatGeekURL, (res) => {
    let str = '';

    res.on('data', (d) => {
      str += d;
    });

    res.on('end', () => {
      var json = JSON.parse(str);
      handleJson(json);
    });

  }).on('error', (e) => {
    console.error(e);
  });
}

function init() {
  //setInterval(getTicketData, intervalTimer);
  getTicketData();
}

init();
