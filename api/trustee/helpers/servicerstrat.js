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

var servicerstrattable = {

  servicerstrat: function (loantape, month, year) {

    var servicerstratarr = [];
    var totala = 0;
    var totalb = 0;
    var pbsum = 0;

    if(month == 9 && year == 2022){
      var json = {
        "CUSIP": "Total",
        "Name": "",
        "Servicer Name": "",
        "Moodys Servicer Rating": "",
        "S&Ps Servicer Rating": "",
        "Notional Amount": "",
        "% of Total": ""
      }
  
      servicerstratarr.push(json);
    } else if(month == 10 && year == 2022){
      var json = {
        "CUSIP": "Total",
        "Name": "",
        "Servicer Name": "",
        "Moodys Servicer Rating": "",
        "S&Ps Servicer Rating": "",
        "Notional Amount": "",
        "% of Total": ""
      }
  
      servicerstratarr.push(json);
    }
    else{
    //calculating sum of principalbalance
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);
      pbsum = parseFloat(pbsum) + parseFloat(obj2['PrincipalBalance']);
    }


    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);

      if (String(obj2['ServicerRatingSP']) == "null") {
        var spr = "";
      } else {
        var spr = String(obj2['ServicerRatingSP']);
      }
  
      if (String(obj2['ServicerRatingMoodys']) == "null") {
        var mr = "";
      } else {
        var mr = String(obj2['ServicerRatingMoodys']);
      }
      
      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Servicer Name": String(obj2['ServicerName']),
        "Moodys Servicer Rating": String(mr),
        "S&Ps Servicer Rating": String(spr),
        "Notional Amount": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
        "% of Total": String(parseFloat(parseFloat(parseFloat(obj2['PrincipalBalance']) / parseFloat(pbsum)) * 100).toFixed(2)) + "%",
      }

      servicerstratarr.push(json);
      totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);
      totalb = parseFloat(totalb) + parseFloat(json['% of Total']);

    }

    var json = {
      "CUSIP": "Total",
      "Name": "",
      "Servicer Name": "",
      "Moodys Servicer Rating": "",
      "S&Ps Servicer Rating": "",
      "Notional Amount": String(parseFloat(totala).toFixed(2)),
      "% of Total": String(Math.round(totalb).toFixed(2)) + "%",
    }

    servicerstratarr.push(json);
  }

    console.log("servicerstratarr table:::" + JSON.stringify(servicerstratarr));
    return servicerstratarr;
  }
}
module.exports = servicerstrattable;