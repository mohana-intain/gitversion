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

var portfolioindustrystrattable = {

  portfolioindustrystrat: function (loantape, month, year) {

    var portfolioindustrystratarr = [];
    let mapa = new Map();
    let mapb = new Map();
    let mapc = new Map();
    var totala = 0;
    var totalb = 0;
    var totalc = 0;

if(month==9 && year==2022){
  var json = {
    "Description": "",
    "# of Assets": "",
    "Balance": "",
    "% of Total": ""
  }

  portfolioindustrystratarr.push(json);
} else if(month==10 && year==2022){
  var json = {
    "Description": "",
    "# of Assets": "",
    "Balance": "",
    "% of Total": ""
  }

  portfolioindustrystratarr.push(json);
}
    else{
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);
      console.log(String(obj2['SpecifiedType']));

      //count
      if (mapa.get(obj2['SpecifiedType'])) {
        mapa.set(obj2['SpecifiedType'], parseInt(mapa.get(obj2['SpecifiedType'])) + 1);
      } else {
        mapa.set(obj2['SpecifiedType'], parseInt("1"));
      }

      //balance
      if (mapb.get(obj2['SpecifiedType'])) {
        mapb.set(obj2['SpecifiedType'], parseFloat(parseFloat(mapb.get(obj2['SpecifiedType'])) + parseFloat(obj2['PrincipalBalance'])));
      } else {
        mapb.set(obj2['SpecifiedType'], parseFloat(obj2['PrincipalBalance']));
      }

    }

    mapb.forEach(function (value, key) {
      totalb = parseFloat(totalb) + parseFloat(value);
    });

    mapb.forEach(function (value, key) {
      var temp = parseFloat(value) / parseFloat(totalb);
      temp = parseFloat(temp) * 100;
      mapc.set(key, parseFloat(temp));

      totala = parseFloat(totala) + parseFloat(mapa.get(key));
      totalc = parseFloat(totalc) + parseFloat(mapc.get(key));

    });

    mapa.forEach(function (value, key) {
      var json = {
        "Description": key,
        "# of Assets": value,
        "Balance": parseFloat(mapb.get(key)).toFixed(2),
        "% of Total": String(parseFloat(mapc.get(key)).toFixed(2)) + "%"
      }

      portfolioindustrystratarr.push(json);
    });

    var json = {
      "Description": "Total",
      "# of Assets": parseInt(totala),
      "Balance": parseFloat(totalb).toFixed(2),
      "% of Total": String(parseFloat(totalc).toFixed(2)) + "%"
    }

    portfolioindustrystratarr.push(json);
  }
    console.log("portfolioindustrystrat table:::" + JSON.stringify(portfolioindustrystratarr));
    return portfolioindustrystratarr;
  }
}
module.exports = portfolioindustrystrattable;