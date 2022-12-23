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

var collateraltable = {

  collateralinfo: function (loantape, month, year) {

    var collateralinfoarr = [];
    var totala = 0;
    var totalb = 0;
    var pbsum = 0;
    var totalarr = ["1.25%", "0.65%", "1.15%", "1.10%", "4.10%", "5.35%", "1.55%", "2.80%"]
if(month == 9 && year==2022){
  var json = {
    "CUSIP": "",
    "Name": "",
    "Notional Amount": "",
    "Specified Type": "",
    "% of Total": ""
  }
  collateralinfoarr.push(json);

  }else if(month == 10 && year==2022){
    var json = {
      "CUSIP": "",
      "Name": "",
      "Notional Amount": "",
      "Specified Type": "",
      "% of Total": ""
    }
    collateralinfoarr.push(json);
  
    }else{  //calculating sum of principalbalance
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);
      pbsum = parseFloat(pbsum) + parseFloat(obj2['PrincipalBalance']);
    }

    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);

      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Notional Amount": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
        "Specified Type": String(obj2['SpecifiedType']),
        "% of Total": String(totalarr[i])
      }

      collateralinfoarr.push(json);
    }

      totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);
      // totalb = parseFloat(totalb) + parseFloat(json['% of Total']);
      var json = {
        "CUSIP": "Total",
        "Name": "",
        "Notional Amount": String(parseFloat(totala).toFixed(2)),
        "Specified Type": "",
        "% of Total": ""
      }
      collateralinfoarr.push(json);
    }



    console.log("collateralinfoarr table:::" + JSON.stringify(collateralinfoarr));
    return collateralinfoarr;
  }
}
module.exports = collateraltable;