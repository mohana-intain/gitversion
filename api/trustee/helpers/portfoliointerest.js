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

var portfoliointeresttable = {

  portfoliointerest: function (loantape, month, year) {

    var portfoliointarr = [];
    var totala = 0;
    var totalb = 0;

    if (month==10 && year==2022){
      var json = {
        "CUSIP": "",
        "Name": "",
        "Interest Collections": "",
        "Principal Balance": "",
        "Calculation Methods": "",
        "Index Type": "",
        "Spread": "",
        "Current Coupon": "",
        "Coupon Type": "",
        "Payment Frequency": ""
      }
      portfoliointarr.push(json);
  
  }else{
    for (var i = 0; i < loantape.length-3; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);
// if(String(obj2['Days']))
  // console.log("PortfolioInterestObject  - - " + obj1);
  // console.log("Length - " + loantape.length)
  // if(String(obj2['Days']) != "" && String(obj2['IndexType']) != ""){
      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Interest Collections": String(parseFloat(obj2['InterestCollection']).toFixed(2)), //ask swapnil
        "Principal Balance": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
        "Calculation Methods": String(obj2['Days']),
        "Index Type": String(obj2['IndexType']),
        "Spread": String(parseFloat(obj2['Spread']).toFixed(2)),
        "Current Coupon": String(parseFloat(obj2['InterestRate']).toFixed(2)),
        "Coupon Type": String(obj2['CouponType']),
        "Payment Frequency": String(obj2['PaymentFrequency'])
      }
    // }

    // else{}
      totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);
      totalb = parseFloat(totalb) + parseFloat(obj2['InterestCollection']);
      portfoliointarr.push(json);
    }

    var json = {
      "CUSIP": "Total",
      "Name": "",
      "Interest Collections": String(parseFloat(totalb).toFixed(2)),
      "Principal Balance": String(parseFloat(totala).toFixed(2)),
      "Calculation Methods": "",
      "Index Type": "",
      "Spread": "",
      "Current Coupon": "",
      "Coupon Type": "",
      "Payment Frequency": ""
    }
    portfoliointarr.push(json);

  }
    console.log("portfoliointerest table:::" + JSON.stringify(portfoliointarr));
    return portfoliointarr;
  }
}
module.exports = portfoliointeresttable;