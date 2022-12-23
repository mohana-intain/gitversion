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

var investmenttable = {

  investmentdetails: function (loantape, month, year) {

    var invarr = [];
    var totala = 0;

    if(month ==9 && year==2022){
      var json = {
        "CUSIP": "",
        "Name": "",
        "Notional Amount": "",
        "Current Market Value": "",
        "Moodys Recovery Rate": "",
        "S&Ps Recovery Rate": "",
        "Fitch Recovery Rate": "",
        "Calculation Amount": ""
      }
  
      invarr.push(json);
    } else if(month ==10 && year==2022){
      var json = {
        "CUSIP": "",
        "Name": "",
        "Notional Amount": "",
        "Current Market Value": "",
        "Moodys Recovery Rate": "",
        "S&Ps Recovery Rate": "",
        "Fitch Recovery Rate": "",
        "Calculation Amount": ""
      }
  
      invarr.push(json);
    }
    else{
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);

      if (String(obj2['DerivedFitchRating']) == "" || String(obj2['DerivedFitchRating']) == "null") {
        obj2['DerivedFitchRating'] = ""
      }

      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Notional Amount": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
        "Current Market Value": String(parseFloat(obj2['Marketvalue']).toFixed(2)),
        "Moodys Recovery Rate": String(parseFloat(obj2['MCOrec']).toFixed(2)),
        "S&Ps Recovery Rate": String(parseFloat(obj2['SPrec']).toFixed(2)),
        "Fitch Recovery Rate": String(obj2['DerivedFitchRating']),
        "Calculation Amount": String(parseFloat(obj2['Calculatedamount']).toFixed(2)),
      }
      invarr.push(json);
      totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);
    }

    var json = {
      "CUSIP": String("Total"),
      "Name": "",
      "Notional Amount": String(parseFloat(totala).toFixed(2)),
      "Current Market Value": "",
      "Moodys Recovery Rate": "",
      "S&Ps Recovery Rate": "",
      "Fitch Recovery Rate": "",
      "Calculation Amount": ""
    }

    invarr.push(json);
  }

    console.log("investment credit table:::" + JSON.stringify(invarr));
    return invarr;
  }
}
module.exports = investmenttable;