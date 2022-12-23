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

var aggregatetable = {

    aggreagteprincipalbal: function (loantape, month, year) {

        var aggarr = [];
        var totala = 0;
        var totalb = 0;

        if (month == 2 && year == 2022) {
            var json = {
                "CUSIP": "",
                "Name": "",
                "Type": "",
                "Principal Balance": "",
                "Calculation Amount": ""
            }
            aggarr.push(json);
        } else {
            for (var i = 0; i < loantape.length; ++i) {
                var obj1 = JSON.stringify(loantape[i]);
                var obj2 = JSON.parse(obj1);

                if (String(obj2['Status']) == "1") {
                    var json = {
                        "CUSIP": String(obj2['Cusip']),
                        "Name": String(obj2['IssueName']),
                        "Type": String(obj2['SecurityType']),
                        "Principal Balance": String(parseFloat(obj2['PrincipalBalance']).toFixed(2)),
                        "Calculation Amount": String(parseFloat(obj2['CalAmt']).toFixed(2))
                    }

                    totala = parseFloat(totala) + parseFloat(obj2['PrincipalBalance']);
                    totalb = parseFloat(totalb) + parseFloat(obj2['CalAmt']);

                    aggarr.push(json);
                }
            }

            var json = {
                "CUSIP": String("Total"),
                "Name": "",
                "Type": "",
                "Principal Balance": String(parseFloat(totala).toFixed(2)),
                "Calculation Amount": String(parseFloat(totalb).toFixed(2))
            }

            aggarr.push(json);
        }

        console.log("aggregate table:::" + JSON.stringify(aggarr));
        return aggarr;
    }
}
module.exports = aggregatetable;