var HashMap = require('hashmap');
var path = require('path');
var fs = require('fs');
var request = require('request');
const fabricURL = process.env.charlesFortfabricURL;
const uuidv4 = require('uuid/v4');
const xlsx = require('read-excel-file/node');
const EventEmitter = require('events').EventEmitter;
var MongoClient = require('mongodb').MongoClient
var log4js = require("log4js");
var logger = log4js.getLogger();

var ratingsissuancetable = {

  ratingsissuance: function (loantape, month, year) {

    var ratingissuancearr = [];
    var totala = 0;
    if (month==9 && year==2022){var json = {
      "CUSIP": "",
      "Name": "",
      "Notional Amount": "",
      "Standard and Poors": "",
      "Issue Date": ""
    }
    ratingissuancearr.push(json);

  }  else if (month==10 && year==2022){var json = {
    "CUSIP": "",
    "Name": "",
    "Notional Amount": "",
    "Standard and Poors": "",
    "Issue Date": ""
  }
  ratingissuancearr.push(json);

}
    
    else{
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);
      console.log("Issuer DATE - "+ String(obj2['IssuerDate']));
      var tempdate = String(obj2['IssuerDate']).split("-")

      console.log(tempdate.length);
      if(tempdate.length > 3){
      var issuerdate = String(tempdate[1]) + "-" + String(tempdate[0]) + "-" + String(tempdate[2])
      }else
      {
       var issuerdate = "";
      }
      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Notional Amount": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
        "Standard and Poors": String(obj2['SPIssuanceRating']),
        "Issue Date": String(issuerdate)
      }

      ratingissuancearr.push(json);

      totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);

    }

    var json = {
      "CUSIP": String("Total"),
      "Name": "",
      "Notional Amount": String(parseFloat(totala).toFixed(2)),
      "Standard and Poors": "",
      "Issue Date": ""
    }
    ratingissuancearr.push(json);

  }

    console.log("ratingissuance table:::" + JSON.stringify(ratingissuancearr));
    return ratingissuancearr;
  }
}
module.exports = ratingsissuancetable;