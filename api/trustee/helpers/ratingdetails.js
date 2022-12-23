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

var ratingtable = {

  ratingdetails: function (loantape, month, year) {

    var ratingarr = [];
    var totala = 0;
     if (month==9 && year==2022){
      var json = {
        "CUSIP": "",
        "Name": "",
        "Type": "",
        "Principal Balance": "",
        "Moodys Rating": "",
        "Moodys Derived Rating": "",
        "S&Ps Rating": "",
        "S&Ps Derived Rating": "",
        "Fitch Rating": "",
        "Fitch Derived Ratings": ""
      }
      ratingarr.push(json);

    } else  if (month==10 && year==2022){
      var json = {
        "CUSIP": "",
        "Name": "",
        "Type": "",
        "Principal Balance": "",
        "Moodys Rating": "",
        "Moodys Derived Rating": "",
        "S&Ps Rating": "",
        "S&Ps Derived Rating": "",
        "Fitch Rating": "",
        "Fitch Derived Ratings": ""
      }
      ratingarr.push(json);

    }    
     else {
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);

      if (String(obj2['DerivedMoodysRating']) == "" || String(obj2['DerivedMoodysRating']) == "null") {
        obj2['DerivedMoodysRating'] = ""
      }

      if (String(obj2['DerivedSPRating']) == "" || String(obj2['DerivedSPRating']) == "null") {
        obj2['DerivedSPRating'] = ""
      }

      if (String(obj2['DerivedFitchRating']) == "" || String(obj2['DerivedFitchRating']) == "null") {
        obj2['DerivedFitchRating'] = ""
      }

      if (String(obj2['GlobalFitchRating']) == "" || String(obj2['GlobalFitchRating']) == "null") {
        obj2['GlobalFitchRating'] = ""
      }

      if (String(obj2['SPIssuerRating']) == "" || String(obj2['SPIssuerRating']) == "null") {
        obj2['SPIssuerRating'] = ""
      }

      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Type": String(obj2['InvestmentType']),
        "Principal Balance": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
        "Moodys Rating": String(obj2['MoodysRating']),
        "Moodys Derived Rating": String(obj2['DerivedMoodysRating']),
        "S&Ps Rating": String(obj2['SPIssuerRating']),
        "S&Ps Derived Rating": String(obj2['DerivedSPRating']),
        "Fitch Rating": String(obj2['GlobalFitchRating']),
        "Fitch Derived Ratings": String(obj2['DerivedFitchRating'])
      }
      ratingarr.push(json);
      totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);
      
    }
    var json = {
      "CUSIP": String("Total"),
      "Name": "",
      "Type": "",
      "Principal Balance": String(parseFloat(totala).toFixed(2)),
      "Moodys Rating": "",
      "Moodys Derived Rating": "",
      "S&Ps Rating": "",
      "S&Ps Derived Rating": "",
      "Fitch Rating": "",
      "Fitch Derived Ratings": ""
    }
    ratingarr.push(json);


  }

    

    console.log("rating table:::" + JSON.stringify(ratingarr));
    return ratingarr;
  }
}
module.exports = ratingtable;