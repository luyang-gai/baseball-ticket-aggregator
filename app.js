var mongoClient = require('mongodb').MongoClient;

const https = require('https');
var url = 'https://api.seatgeek.com/2/events?q=seattle+mariners';

var cleanupObject = function(event) {
  delete event['links'];
  delete event['announce_date'];
  delete event['date_tbd'];
  delete event['type'];
  delete event['time_tbd'];
  delete event['taxonomies'];
  delete event['performers'];
  delete event['datetime_utc'];
  delete event['created_at'];
  delete event['venue'];
  delete event['datetime_tbd'];
};

var handleJson = function(json) {
  mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
    if (!err) {
      console.log('We are connected');
    }
    else {
      console.log('failed to connect');
    }

    var currentDate = new Date(Date.now());
    var collection = db.collection('newBaseballData');

    var recordsInserted = 0;

    for (var event of json.events) {
      cleanupObject(event);
      event['entryDate'] = currentDate.toDateString();
      event['entryTime'] = currentDate.toLocaleTimeString();
      collection.insert(event, function(err) {
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
    }

  });
};

var getTicketData = function() {
  https.get(url, function(res) {
    var str = '';

    res.on('data', function(d) {
      str += d;
    });

    res.on('end', function() {
      //console.log(str);
      var json = JSON.parse(str);
      handleJson(json);
    });

  }).on('error', function(e) {
    console.error(e);
  });
};

setInterval(getTicketData, 10000);