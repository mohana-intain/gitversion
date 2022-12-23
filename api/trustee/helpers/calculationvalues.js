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
const { addYears } = require('date-and-time');
var logger = log4js.getLogger();

var calculationvalues = {

  calculatetable: function (loantape, inputmonth, inputyear) {

    //aggregate princnpal table - 1st table
    var val1 = 0;
    var val2 = 0;
    var val3 = 0;
    var val4 = 0;
    var val5 = 0;
    var val6 = 0;
    var val7 = 0;

    //aggregate princnpal table - 2nd table
    var val8 = 0;
    var val9 = 0;
    var val10 = 0;
    var val11 = 0;
    var val12 = 0;
    var val13 = 0;
    var val14 = 0;

    //test summary
    var arg108num = 0;
    var arg108deno = 0;
    var arg108 = 0;

    var arg109num = 0;
    var arg109deno = 100;
    var arg109 = 0;

    var arg110num = 0;
    var arg110 = 0;

    var arg111num = 0;
    var arg111 = 0;

    var arg112 = 0;
    var arg113 = 0;
    var arg114 = 0;
    var arg115 = 0;
    var arg116 = 0;
    var arg117 = 0;
    var arg118 = 0;
    var arg119 = 0;
    var arg120 = 0;
    var arg121 = 0;
    var arg122 = 0;
    var arg123 = 0;
    var arg124 = 0;
    var arg125num = 0;
    var arg125 = 0;

    
    for (var i = 0; i < loantape.length; ++i) {
      var obj1 = JSON.stringify(loantape[i]);
      var obj2 = JSON.parse(obj1);
      if(i == loantape.length-1) {
        obj2['Maturity'] = "10-08-2047";
      }

      if(String(obj2['SecurityType']).toLowerCase() == "abs" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val1 = parseFloat(val1) + parseFloat(obj2['PrincipalBalance']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "reit" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val2 = parseFloat(val2) + parseFloat(obj2['PrincipalBalance']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "cd0" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val3 = parseFloat(val3) + parseFloat(obj2['PrincipalBalance']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "clo" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val4 = parseFloat(val4) + parseFloat(obj2['PrincipalBalance']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "rmb" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val5 = parseFloat(val5) + parseFloat(obj2['PrincipalBalance']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "cmb" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val6 = parseFloat(val6) + parseFloat(obj2['PrincipalBalance']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "oth" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val7 = parseFloat(val7) + parseFloat(obj2['PrincipalBalance']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "abs" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val8 = parseFloat(val8) + parseFloat(obj2['Calculatedamount']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "reit" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val9 = parseFloat(val9) + parseFloat(obj2['Calculatedamount']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "cdo" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val10 = parseFloat(val10) + parseFloat(obj2['Calculatedamount']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "clo" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val11 = parseFloat(val11) + parseFloat(obj2['Calculatedamount']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "rmb" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val12 = parseFloat(val12) + parseFloat(obj2['Calculatedamount']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "cmb" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val13 = parseFloat(val13) + parseFloat(obj2['Calculatedamount']);
      }

      if(String(obj2['SecurityType']).toLowerCase() == "oth" && String(obj2['CreditOpinion']).toLowerCase() == "non") {
        val14 = parseFloat(val14) + parseFloat(obj2['Calculatedamount']);
      }

      //test summary
      if(parseInt(obj2['IsDefaulted']) == 0){
        //108
        arg108num = parseFloat(arg108num) + parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['warf']);
        arg108deno = parseFloat(arg108deno) + parseFloat(obj2['PrincipalBalance']);

        //109
        arg109num = parseFloat(arg109num) + parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['Spread']);

        //110
        arg110num = parseFloat(arg110num) + parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['EstimatedAverageLife']);

        //111
        arg111num = parseFloat(arg111num) + parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['MCOrec']);

        //125
        arg125num = parseFloat(arg125num) + parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['SPrec']);
      }

      //112
      var m1 = String(obj2['Maturity']).split("-");
      // console.log(obj2['Maturity']);
      var maturitydate = m1[1] + "/" + m1[0] + "/" + m1[2];
      var datetemp = "07/09/2047";
      console.log(maturitydate + "   :  " + datetemp);
      var objm = new Date(maturitydate);
      var objd = new Date(datetemp);
      console.log(objm.getTime() + "   :  " + objd.getTime());
      if (objm.getTime() > objd.getTime()) {
        console.log("true:: " + i);
        console.log("arg112:: " + arg112);
        console.log("parseFloat(obj2['PrincipalBalance']):: " + parseFloat(obj2['PrincipalBalance']));
        arg112 = parseFloat(arg112) + parseFloat(obj2['PrincipalBalance']);
        
      }

      //113
      arg113 = parseFloat(arg113) + parseFloat(obj2['PrincipalBalance']);

      //114
      if(parseFloat(obj2['MCORatingidx']) > 0 && parseFloat(obj2['SPRatingidx']) > 10) {
        arg114 = parseFloat(arg114) + parseFloat(obj2['PrincipalBalance']);
      }

      //115
      if(parseFloat(obj2['PrincipalBalance']) > arg115) {
        arg115 = parseFloat(obj2['PrincipalBalance']);
      }

      //116
      if(String(obj2['ServicerRatingMoodys']).toLowerCase() == "sq1" || String(obj2['ServicerRatingSP']).toLowerCase() == "strong") {
        arg116 = parseFloat(arg116) + parseFloat(obj2['PrincipalBalance']);
      }

      //117
      if(parseFloat(obj2['ServicerRatingMoodys1']) <= 3 || parseFloat(obj2['ServicerRatingSP1']) <= 4) {
        arg117 = parseFloat(arg117) + parseFloat(obj2['PrincipalBalance']);
      }

      //118
      if(parseFloat(obj2['ServicerRatingMoodys1']) >= 3 || parseFloat(obj2['ServicerRatingSP1']) >=  4) {
        arg118 = parseFloat(arg118) + parseFloat(obj2['PrincipalBalance']);
      }
      
      //119
      if(parseInt(obj2['IsPIK']) == 1) {
        arg119 = parseFloat(arg119) + parseFloat(obj2['PrincipalBalance']);
      }

      //120
      if(String(obj2['SpecifiedType']) == "Residential A Mortgage") {
        arg120 = parseFloat(arg120) + parseFloat(obj2['PrincipalBalance']);
      }

      //121
      if(String(obj2['SpecifiedType']) == "Residential B/C Mortgage") {
        arg121 = parseFloat(arg121) + parseFloat(obj2['PrincipalBalance']);
      }

      //122
      if(String(obj2['Negamissued']).toLowerCase() == "issued") {
        arg122 = parseFloat(arg122) + parseFloat(obj2['PrincipalBalance']);
      }

      //123
      if(parseFloat(obj2['MCORatingidx']) <= 10 || parseFloat(obj2['SPRatingidx']) <=  10) {
        arg123 = parseFloat(arg123) + parseFloat(obj2['PrincipalBalance']);
      }

      //124
      if(String(obj2['SpecifiedType']) == "ABS CDO") {
        arg124 = parseFloat(arg124) + parseFloat(obj2['PrincipalBalance']);
      }
    }

    arg108 = parseFloat(arg108num)/parseFloat(arg108deno);
    arg109 = parseFloat(arg109num)/parseFloat(arg108deno)/parseFloat(arg109deno);
    arg110 = parseFloat(arg110num)/parseFloat(arg108deno);
    arg111 = parseFloat(arg111num)/parseFloat(arg108deno)/parseFloat(arg109deno);
    arg125 = parseFloat(arg125num)/parseFloat(arg108deno)/parseFloat(arg109deno);

    arr = [val1, val2, val3, val4, val5, val6, val7, val8, val9, val10, val11, val12, val13, val14, arg108,
    arg109, arg110, arg111, arg112, arg113, arg114, arg115, arg116, arg117, arg118, arg119, arg120, arg121,
    arg122, arg123, arg124, arg125]

    console.log("cal data:::" + JSON.stringify(arr));

    return arr;
  }
}
module.exports = calculationvalues;