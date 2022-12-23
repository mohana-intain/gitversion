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

var portfoliocolsalestable = {

  portfoliocolsales: function (loantape, month, year) {

    var portfoliocolsalesarr = [];
    var totala = 0;

    if(month==10 && year==2022){
      var json = {
        "CUSIP": "",
        "Name": "",
        "Sales Date": "",
        "Sales Receipts": ""
      }
      portfoliocolsalesarr.push(json);
    }
    else {
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);

      if (i==0){
        console.log("String of DAte - " + JSON.stringify(obj2));
      }
      console.log("Sales DATE - "+ String(obj2['SalesDate']));

      var saledate = String(obj2['SalesDate']);
      var salearr = String(saledate).split("-");
      var s = salearr[1]+"-"+salearr[0]+"-"+salearr[2];  
      
      // console.log("SSSSSS (saledate) "+s);
        

      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Sales Date": String(s),
        "Sales Receipts": String(parseFloat(obj2['SalesReceipts']).toFixed(2))
}
    
      portfoliocolsalesarr.push(json);

      totala = parseFloat(totala) + parseFloat(obj2['SalesReceipts']);

    }

    var json = {
      "CUSIP": String("Total"),
      "Name": "",
      "Sales Date": "",
      "Sales Receipts": String(parseFloat(totala).toFixed(2))
    }
  
    portfoliocolsalesarr.push(json);
  }
    console.log("portfolio collateral sales table:::" + JSON.stringify(portfoliocolsalesarr));
    return portfoliocolsalesarr;
  }
}
module.exports = portfoliocolsalestable;