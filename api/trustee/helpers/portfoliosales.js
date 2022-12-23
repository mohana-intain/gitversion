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

var portfoliosalestable = {

    portfoliosales: function (loantape, month, year) {

        var portfoliosalesarr = [];
        var totala = 0;
        var totalb = 0;
        for (var i = 0; i < loantape.length; ++i) {
            var obj1 = JSON.stringify(loantape[i]);
            var obj2 = JSON.parse(obj1);
            var saledate = String(obj2['SaleDate']);

            var salearr = String(saledate).split("-");
            var s = salearr[1]+"-"+salearr[0]+"-"+salearr[2];
                var json = {
                    "CUSIP": String(obj2['Cusip']),
                    "Name": String(obj2['IssueName']),
                    "Sales Date": String(s),
                    "Sales Receipts": String(parseFloat(obj2['SaleReceipts']).toFixed(2))
                }

                portfoliosalesarr.push(json);

                totala = parseFloat(totala) + parseFloat(obj2['SaleReceipts']);

        }

        var json = {
            "CUSIP": String("Total"),
            "Name": "",
            "Sales Date": "",
            "Sales Receipts": String(parseFloat(totala).toFixed(2))
        }
        portfoliosalesarr.push(json);

        console.log("portfoliosales table:::"+ JSON.stringify(portfoliosalesarr));
        return portfoliosalesarr;
    }
}
module.exports = portfoliosalestable;