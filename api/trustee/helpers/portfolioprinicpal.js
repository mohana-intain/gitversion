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

var portfolioprincipaltable = {

  portfolioprinicpal: function (loantape, month, year) {

    var portfolioprinarr = [];
    var totala = 0;
    var totalb = 0;
    var totalc = 0;
    var pbsum = 0;
    if (month==10 && year==2022){
      var json = {
        "CUSIP": "",
        "Name": "",
        "Currency Type": "",
        "Principal Repayments/(Negative Amortization)": "",
        "Current Balance": "",
        "% of Total": "",
        "Maturity Date": ""
      }
      portfolioprinarr.push(json);
      }
  
  else{
    //calculating sum of principalbalance
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);
      pbsum = parseFloat(pbsum) + parseFloat(obj2['PrincipalBalance']);
    }

    for (var i = 0; i < loantape.length-3; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);

      var tempdate = String(obj2['Maturity']).split("-")
      var maturitydate = String(tempdate[1]) + "-" + String(tempdate[0]) + "-" + String(tempdate[2])

      // console.log(obj1);

// if(String(obj2['Cusip'])!= "00075XAP2" || String(obj2['Cusip'])!= "40430HBH0" || String(obj2['Cusip'])!= "46630MBD3" ){
      var json = {
        "CUSIP": String(obj2['Cusip']),
        "Name": String(obj2['SecurityName']),
        "Currency Type": String(obj2['Currency']),
        "Principal Repayments/(Negative Amortization)": String(parseFloat(obj2['PrincipalCollection']).toFixed(2)),
        "Current Balance": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
        // "% of Total": String(parseFloat(parseFloat(parseFloat(obj2['PrincipalBalance']) / parseFloat(pbsum))* 100).toFixed(2)) + "%",
        "% of Total": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)) + "%",

        "Maturity Date": String(maturitydate)
      }
    // }
    // else
    // {

    // }
      portfolioprinarr.push(json);

      totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);
      totalb = parseFloat(totalb) + parseFloat(json['% of Total']);
      totalc = parseFloat(totalc) + parseFloat(obj2['PrincipalCollection']);
      console.log("totalb:: " + totalb);
      console.log("json      " + json['% of Total']);
    }

    var json = {
      "CUSIP": "Total",
      "Name": "",
      "Currency Type": "",
      "Principal Repayments/(Negative Amortization)": String(parseFloat(totalc).toFixed(2)),
      "Current Balance": String(parseFloat(totala).toFixed(2)),
      "% of Total": String(Math.round(totalb).toFixed(2)) + "%",
      "Maturity Date": ""
    }
    portfolioprinarr.push(json);
  }
    console.log("portfolioprincipal table:::" + JSON.stringify(portfolioprinarr));
    return portfolioprinarr;
  }
}
module.exports = portfolioprincipaltable;