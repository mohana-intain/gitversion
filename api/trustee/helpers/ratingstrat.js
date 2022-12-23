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

var ratingstrattable = {

  ratingstrat: function (loantape, month, year) {

    var ratingstratarr = [];
    let mapa = new Map();
    let mapb = new Map();
    let mapc = new Map();
    let mapg = new Map();
    var totala = 0;
    var totalb = 0;
    var totalc = 0;

    let mapd = new Map();
    let mape = new Map();
    let mapf = new Map();
    let maph = new Map();
    let mapi = new Map();
    var totald = 0;
    var totale = 0;
    var totalf = 0;

    var totalg = 0;
    var totalh = 0;
    var totali = 0;

    var arr1 = [];
    var arr2 = [];
    var arr3 = [];
    var finalarr = [];

    if(month == 9 && year==2022)
    {

      var json = {
        "Moodys Rating": "",
        "# of Assets": "",
        "Balance": "",
        "% of Total": ""
      }
  
      arr1.push(json);
      ratingstratarr.push(json);

      var json = {
        "S&Ps Rating": "",
        "# of Assets": "",
        "Balance": "",
        "% of Total": ""
      }
      arr2.push(json);
      ratingstratarr.push(json);

      var json = {
        "Fitchs Rating": "",
        "# of Assets": "",
        "Balance": "",
        "% of Total": ""
      }

      arr3.push(json);
      ratingstratarr.push(json);
      finalarr.push(arr1);
    finalarr.push(arr2);
    finalarr.push(arr3);

    }
  else  if(month == 10 && year==2022)
    {

      var json = {
        "Moodys Rating": "",
        "# of Assets": "",
        "Balance": "",
        "% of Total": ""
      }
  
      arr1.push(json);
      ratingstratarr.push(json);

      var json = {
        "S&Ps Rating": "",
        "# of Assets": "",
        "Balance": "",
        "% of Total": ""
      }
      arr2.push(json);
      ratingstratarr.push(json);

      var json = {
        "Fitchs Rating": "",
        "# of Assets": "",
        "Balance": "",
        "% of Total": ""
      }

      arr3.push(json);
      ratingstratarr.push(json);
      finalarr.push(arr1);
    finalarr.push(arr2);
    finalarr.push(arr3);

    }


    else{

    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);

      console.log(String(obj2['MoodysRating']));

      if (String(obj2['MoodysRating']) == "" || String(obj2['MoodysRating']) == "null") {
        obj2['MoodysRating'] = "No Rating"
      }
      //count
      if (mapa.get(obj2['MoodysRating'])) {
        mapa.set(obj2['MoodysRating'], parseInt(mapa.get(obj2['MoodysRating'])) + 1);
      } else {
        mapa.set(obj2['MoodysRating'], parseInt("1"));
      }

      //balance
      if (mapb.get(obj2['MoodysRating'])) {
        mapb.set(obj2['MoodysRating'], parseFloat(parseFloat(mapb.get(obj2['MoodysRating'])) + parseFloat(obj2['PrincipalBalance'])));
      } else {
        mapb.set(obj2['MoodysRating'], parseFloat(obj2['PrincipalBalance']));
      }


      if (String(obj2['SPRating']) == "" || String(obj2['SPRating']) == "null") {
        obj2['SPRating'] = "No Rating"
      }

      //count
      if (mapd.get(obj2['SPRating'])) {
        mapd.set(obj2['SPRating'], parseInt(mapd.get(obj2['SPRating'])) + 1);
      } else {
        mapd.set(obj2['SPRating'], parseInt("1"));
      }

      //balance
      if (mape.get(obj2['SPRating'])) {
        mape.set(obj2['SPRating'], parseFloat(parseFloat(mape.get(obj2['SPRating'])) + parseFloat(obj2['PrincipalBalance'])));
      } else {
        mape.set(obj2['SPRating'], parseFloat(obj2['PrincipalBalance']));
      }

      if (String(obj2['GlobalFitchRating']) == "" || String(obj2['GlobalFitchRating']) == "null") {
        obj2['GlobalFitchRating'] = "No Rating"
      }

      //count
      if (mapg.get(obj2['GlobalFitchRating'])) {
        mapg.set(obj2['GlobalFitchRating'], parseInt(mapg.get(obj2['GlobalFitchRating'])) + 1);
      } else {
        mapg.set(obj2['GlobalFitchRating'], parseInt("1"));
      }

      //balance
      if (maph.get(obj2['GlobalFitchRating'])) {
        maph.set(obj2['GlobalFitchRating'], parseFloat(parseFloat(maph.get(obj2['GlobalFitchRating'])) + parseFloat(obj2['PrincipalBalance'])));
      } else {
        maph.set(obj2['GlobalFitchRating'], parseFloat(obj2['PrincipalBalance']));
      }
    }

    //1
    mapb.forEach(function (value, key) {
      totalb = parseFloat(totalb) + parseFloat(value);
    });

    mapb.forEach(function (value, key) {
      var temp = parseFloat(value) / parseFloat(totalb).toFixed(2);
      temp = parseFloat(temp) * 100;
      console.log("temp:::" + temp);
      mapc.set(key, parseFloat(temp));

      totala = parseFloat(totala) + parseFloat(mapa.get(key));
      totalc = parseFloat(totalc) + parseFloat(mapc.get(key));
    });

    mapa.forEach(function (value, key) {
      var tempkey = key;
      var json = {
        "Moodys Rating": tempkey,
        "# of Assets": value,
        "Balance": parseFloat(mapb.get(key)).toFixed(2),
        "% of Total": String(parseFloat(mapc.get(key)).toFixed(2)) + "%"
      }
      arr1.push(json);
      ratingstratarr.push(json);
    });

    var json = {
      "Moodys Rating": "Total",
      "# of Assets": parseInt(totala),
      "Balance": parseFloat(totalb).toFixed(2),
      "% of Total": String(parseFloat(totalc).toFixed(2)) + "%"
    }

    arr1.push(json);
    ratingstratarr.push(json);

    //2
    mape.forEach(function (value, key) {
      totale = parseFloat(totale) + parseFloat(value);
    });

    mape.forEach(function (value, key) {
      var temp = parseFloat(value) / parseFloat(totale);
      temp = parseFloat(temp) * 100;
      mapf.set(key, parseFloat(temp));

      totald = parseFloat(totald) + parseFloat(mapd.get(key));
      totalf = parseFloat(totalf) + parseFloat(mapf.get(key));
    });

    mapd.forEach(function (value, key) {
      var tempkey = key;
      var json = {
        "S&Ps Rating": tempkey,
        "# of Assets": value,
        "Balance": parseFloat(mape.get(key)).toFixed(2),
        "% of Total": String(parseFloat(mapf.get(key)).toFixed(2)) + "%"
      }
      arr2.push(json);

      ratingstratarr.push(json);
    });

    var json = {
      "S&Ps Rating": "Total",
      "# of Assets": parseInt(totald),
      "Balance": parseFloat(totale).toFixed(2),
      "% of Total": String(parseFloat(totalf).toFixed(2)) + "%"
    }
    arr2.push(json);

    ratingstratarr.push(json);

    //3
    maph.forEach(function (value, key) {
      totalh = parseFloat(totalh) + parseFloat(value);
    });

    maph.forEach(function (value, key) {
      var temp = parseFloat(value) / parseFloat(totalh).toFixed(2);
      temp = parseFloat(temp) * 100;
      console.log("temp:::" + temp);
      mapi.set(key, parseFloat(temp));

      totalg = parseFloat(totalg) + parseFloat(mapg.get(key));
      totali = parseFloat(totali) + parseFloat(mapi.get(key));
    });

    mapg.forEach(function (value, key) {
      var tempkey = key;
      var json = {
        "Fitchs Rating": tempkey,
        "# of Assets": value,
        "Balance": parseFloat(maph.get(key)).toFixed(2),
        "% of Total": String(parseFloat(mapi.get(key)).toFixed(2)) + "%"
      }
      arr3.push(json);
      ratingstratarr.push(json);
    });

    var json = {
      "Fitchs Rating": "Total",
      "# of Assets": parseInt(totalg),
      "Balance": parseFloat(totalh).toFixed(2),
      "% of Total": String(parseFloat(totali).toFixed(2)) + "%"
    }

    arr3.push(json);
    ratingstratarr.push(json);

    ratingstratarr.push(json);
    finalarr.push(arr1);
    finalarr.push(arr2);
    finalarr.push(arr3);
  }
    console.log("ratingstratarr table:::" + JSON.stringify(finalarr));
    return finalarr;
  }
}
module.exports = ratingstrattable;