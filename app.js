'use strict';

const mongoClient = require('mongodb').MongoClient;
const https = require('https');

const eventKeysToDelete = ['links', 'announce_date', 'date_tbd', 'type', 'time_tbd', 'taxonomies', 'performers', 'datetime_utc', 'created_at', 'venue',
                      'datetime_tbd', 'visible_until_utc'];
const tpsKeysToDelete = ['title', 'score', 'datetime_local', 'url', 'short_title'];

const mongoDbName = 'test';
const eventsCollectionName = 'events';
const tpsCollectionName = 'ticketPriceSnapshots';

const seatGeekURL = 'https://api.seatgeek.com/2/events?venue.id=13';
const intervalTimer = 30 * 60 * 1000; //30 minutes

function cleanupTps(event) {
  for (let key of eventKeysToDelete) {
    delete event[key];
  }
  for (let key of tpsKeysToDelete) {
    delete event[key];
  }

  let stats = event.stats;
  for (let stat in stats) {
    event[stat] = stats[stat];
  }
  delete event['stats'];
}

function cleanupEvent(event) {
  for (let key of eventKeysToDelete) {
    delete event[key];
  }
}

function handleJson(json) {
  let callbacksNeeded = json.events.length * 2;
  let callbacksMade = 0;

  //TODO: figure out less shitty way to handle callbacks
  function callback(db) {
    callbacksMade++;
    if (callbacksMade === callbacksNeeded) {
      console.log('disconnecting');
      db.close();
    }
  }

  //console.log('handleJson called');
  mongoClient.connect(`mongodb://localhost:27017/${mongoDbName}`, (err, db) => {
    if (!err) {
      let currentDate = new Date(Date.now());

      console.log(`We are connected. Inserting at: ${currentDate.toLocaleTimeString()}`);

      for (var event of json.events) {
        insertEvents(db,event, callback);
        insertTPS(db, event, currentDate, callback);
      }
    } else {
      console.log('failed to connect');
    }
  });
}

function insertTPS(db, tps, currentDate, callback) {
  const tpsCollection = db.collection(tpsCollectionName);

  cleanupTps(tps);
  tps['UTC'] = currentDate.toUTCString();
  tps['entryDate'] = currentDate.toDateString();
  tps['entryTime'] = currentDate.toLocaleTimeString();
  tpsCollection.insert(tps, (err) => {
    if (err) {
      console.log(err)
    } else {
      //console.log('one collection insert event passed');
    }
    callback(db);
  });
}

/*
  Given a collection and an event, check if the eventId is stored
  If stored: do nothing
  If not stored: store it
 */
function insertEvents(db, event, callback) {
  const eventsCollection = db.collection(eventsCollectionName);

  eventsCollection.findOne({id: event.id}, function(err, doc) {
    if (err) {
      console.log(`err: ${err}`);
    }
    //doc doesnt exist
    if (doc === null) {
      cleanupEvent(event);
      eventsCollection.insert(event, function() {
        console.log(`Event inserted: ${event.id}`);
        callback(db);
      });
    }
    else {
      callback(db);
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
  setInterval(getTicketData, intervalTimer);
  // getTicketData();
}

init();
