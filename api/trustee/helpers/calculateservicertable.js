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

var servicertable = {

    calculatetable: function (loantape, inputmonth, inputyear) {
        //loantape calculation

        //final arr
        var response = [];

        //1st table
        var currentrmbs = 0;
        var defaultedrmbs = 0;
        var calamtrmbs = 0;
        var haircutrmbs = 0;
        var balancermbs = 0;

        //1st table total
        var totalcurrentrmbs = 0;
        var totaldefaultedrmbs = 0;
        var totalcalamtrmbs = 0;
        var totalhaircutrmbs = 0;
        var totalbalancermbs = 0;

        //2nd a table
        var fixeda = 0;
        var fixedb = 0;
        var fixedc = 0;
        var fixedd = 0;
        var floatinga = 0;
        var floatingb = 0;
        var floatingc = 0;
        var floatingd = 0;

        //2nd b table
        let mapa = new Map();
        let mapb = new Map();
        let mapc = new Map();
        let mapd = new Map();
        let mape = new Map();
        var compres = [];
        var b1 = "0";
        var b2 = "0";
        var b3 = "0";
        var sval = 0;

        //3rd table
        let issuemapa = new Map();
        let issuemapb = new Map();
        var rankarr = [];
        let rankmap = new Map();
        var rankresarr = [];
        //for dec month -inv report
        var headingarr = [];
        headingarr.push("CBASS 2006-RP2");
        headingarr.push("CRMSI 2006-1");
        headingarr.push("CSFB 2003-AR24");
        headingarr.push("MRFC 2002-TBC2");
        headingarr.push("RAAC 2006-RP4");
        headingarr.push("RESIF 2003-B");
        headingarr.push("RESIF 2003-CB1");
        headingarr.push("SEMT 2003-4");
        headingarr.push("SVHE 2006-WF1");
        let issuemapheading = new Map();
        let finalheadingmap = new Map();
        let semt1map = new Map();
        let semt2map = new Map();


        //3rd total
        var issuetotala = 0;
        var issuetotalb = 0;

        //4th table
        var wal = 0;
        var rec = 0;

        //total from loantape
        var totalprinicpalbal = 0;
        var totalmcohaircut = 0;
        var totalsphaircut = 0;
        var totalwarf = 0;
        var totalcalamt = 0;
        var totalinterestrecipt = 0;
        var totalprincipalrecipt = 0;
        var totalsalerecipt = 0;
        //cal fot total
        if((inputmonth == 2 || inputmonth == 3) && inputyear == 2022){
            var num1 = 0;
            var deno1 = 0;
        }else{
            var num1 = 1;
            var deno1 = 1;
        }
       
        //weightedavg from loantape
        var wghtavgrecoveryratemoody = 0;
        var wghtavgsprec = 0;
        var wghtavgcalamt = 0;
        var wghtavgabswalbasecase = 0;

        for (var i = 0; i < loantape.length; ++i) {
            var obj1 = JSON.stringify(loantape[i]);
            var obj2 = JSON.parse(obj1);

            //1st table
            if (String(obj2['SecurityType']).toLowerCase() == "rmbs" && obj2['Status'] == "0") {
                currentrmbs = parseFloat(currentrmbs) + parseFloat(obj2['PrincipalBalance']);
            }

            if (String(obj2['SecurityType']).toLowerCase() == "rmbs" && obj2['Status'] == "1") {
                defaultedrmbs = parseFloat(defaultedrmbs) + parseFloat(obj2['PrincipalBalance']);
            }

            if (String(obj2['SecurityType']).toLowerCase() == "rmbs") {
                // console.log(obj2['CalAmt']);
                calamtrmbs = parseFloat(calamtrmbs) + parseFloat(obj2['CalAmt']);
            }

            if (String(obj2['SecurityType']).toLowerCase() == "rmbs") {
                haircutrmbs = parseFloat(haircutrmbs) + parseFloat(obj2['MCOHaircut']);
            }

            //2nd table - a
            if (String(obj2['CouponType']).toLowerCase() == "fixed") {
                fixeda = parseFloat(fixeda) + parseFloat(obj2['PrincipalBalance']);
            }

            if (String(obj2['CouponType']).toLowerCase() == "fixed" && obj2['Status'] == "0") {
                fixedb = parseFloat(fixedb) + parseFloat(obj2['PrincipalBalance']);
                fixedc = parseFloat(fixedc) + parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['Floating']));
            }

            if (String(obj2['CouponType']).toLowerCase() == "floating") {
                floatinga = parseFloat(floatinga) + parseFloat(obj2['PrincipalBalance']);
            }

            if (String(obj2['CouponType']).toLowerCase() == "floating" && obj2['Status'] == "0") {
                floatingb = parseFloat(floatingb) + parseFloat(obj2['PrincipalBalance']);
                floatingc = parseFloat(floatingc) + parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['Floating']));
            }

            //2nd table - b
            if (mapa.has(String(obj2["ABSServiceName"]).toLowerCase())) {
                mapa.set(String(obj2['ABSServiceName']).toLowerCase(),
                    parseFloat(parseFloat(mapa.get(String(obj2['ABSServiceName']).toLowerCase())) + parseFloat(obj2['PrincipalBalance'])));
            } else {
                mapa.set(String(obj2['ABSServiceName']).toLowerCase(), parseFloat(obj2['PrincipalBalance']));
            }

            //3rd table
            if (String(obj2['IssueName']).toLowerCase().includes('semt')) {
                var temp1 = parseFloat(obj2['PrincipalBalance']);
            } else {
                var temp1 = 0;
            }

            if (!String(obj2['IssueName']).toLowerCase().includes('semt')) {
                var temp2 = parseFloat(obj2['PrincipalBalance']);
            } else {
                var temp2 = 0;
            }

            if (String(obj2['IssueName']).toLowerCase()) {
                issuemapheading.set(obj2['IssueName'], parseFloat(obj2['PrincipalBalance']));
            }

            issuemapa.set(String(obj2['IssueName']).toLowerCase(), temp1);
            issuemapb.set(String(obj2['IssueName']).toLowerCase(), temp2);
            rankarr.push(temp2);

            issuetotala = parseFloat(parseFloat(issuetotala) + parseFloat(temp1)).toFixed(2);
            issuetotalb = parseFloat(parseFloat(issuetotalb) + parseFloat(temp2)).toFixed(2);

            //4th table
            if (String(parseFloat(obj2['Status']).toFixed(2)) == "0.00") {
                wal = parseFloat(parseFloat(wal) + parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['ABSWALBaseCase'])));
                rec = parseFloat(parseFloat(rec) + parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['MCORec'])));
            }

            //totals
            totalprinicpalbal = parseFloat(parseFloat(totalprinicpalbal) + parseFloat(obj2['PrincipalBalance'])).toFixed(2);
            totalmcohaircut = parseFloat(parseFloat(totalmcohaircut) + parseFloat(obj2['MCOHaircut1'])).toFixed(2);
            totalsphaircut = parseFloat(parseFloat(totalsphaircut) + parseFloat(obj2['SPHaircut1'])).toFixed(2);
            //totalwarf = parseFloat(parseFloat(totalwarf) + parseFloat(obj2['Warf'])).toFixed(2);
            totalcalamt = parseFloat(parseFloat(totalcalamt) + parseFloat(obj2['CalAmt'])).toFixed(2);
            totalinterestrecipt = parseFloat(parseFloat(totalinterestrecipt) + parseFloat(obj2['InterestReceipts'])).toFixed(2);
            totalprincipalrecipt = parseFloat(parseFloat(totalprincipalrecipt) + parseFloat(obj2['PrincipalReceipt'])).toFixed(2);
            totalsalerecipt = parseFloat(parseFloat(totalsalerecipt) + parseFloat(obj2['SaleReceipts'])).toFixed(2);

            //cal for total
            // console.log(parseFloat(obj2['Warf']));
            var tnum1 = parseFloat(parseFloat(obj2['Warf']) * parseFloat(obj2['PrincipalBalance']));
            num1 = parseFloat(num1) + (parseFloat(tnum1));
            console.log(tnum1);
            if (String(obj2['Status']).toLowerCase() == "0") {
                deno1 = parseFloat(deno1) + parseFloat(obj2['PrincipalBalance']);
            }

            //weighted avg
            wghtavgrecoveryratemoody = parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['RecoveryRateMoody']));
            wghtavgsprec = parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['SPRec']));
            wghtavgcalamt = parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['CalAmt']));
            wghtavgabswalbasecase = parseFloat(parseFloat(obj2['PrincipalBalance']) * parseFloat(obj2['ABSWALBaseCase']));
        }

        balancermbs = parseFloat(parseFloat(currentrmbs) + parseFloat(defaultedrmbs)).toFixed(2);

        totalcurrentrmbs = parseFloat(currentrmbs).toFixed(2);
        totaldefaultedrmbs = parseFloat(defaultedrmbs).toFixed(2);
        totalcalamtrmbs = parseFloat(calamtrmbs).toFixed(2);
        totalhaircutrmbs = parseFloat(haircutrmbs).toFixed(2);
        totalbalancermbs = parseFloat(balancermbs).toFixed(2);

        console.log("fixedc::" + fixedc);
        // fixedc = parseFloat(parseFloat(fixedc) / parseFloat(fixedb)).toFixed(2);
        fixedc = parseFloat(parseFloat(fixedc) / parseFloat(fixedb))
        // floatingc = parseFloat(parseFloat(floatingc) / parseFloat(floatingb)).toFixed(2);
        floatingc = parseFloat(parseFloat(floatingc) / parseFloat(floatingb))

        floatingd = ((parseFloat(floatingc)-parseFloat(0.95))*parseFloat(floatingb))/parseFloat(fixedb);
        fixedd = parseFloat(parseFloat(fixedc) + parseFloat(floatingd));

        console.log("floatinga::" + floatinga);
        console.log("floatingb::" + floatingb);
        console.log("floatingc::" + floatingc);
        console.log("floatingd::" + floatingd);
        console.log("fixeda::" + fixeda);
        console.log("fixedb::" + fixedb);
        console.log("fixedc::" + fixedc);
        console.log("fixedd::" + fixedd);
        mapb.set(String("Litton Loan Servicing L.P.").toLowerCase(), "");
        mapb.set(String("CitiMortgage Inc.").toLowerCase(), "");
        mapb.set(String("Chase Manhattan Mortgage Corporation").toLowerCase(), "");
        mapb.set(String("Boston Safe Deposit & Trust").toLowerCase(), "");
        mapb.set(String("Residential Funding Corp (RFC)").toLowerCase(), "");
        mapb.set(String("Bank of America, N.A.").toLowerCase(), "");
        mapb.set(String("Morgan Stanley").toLowerCase(), "");
        mapb.set(String("Wells Fargo Bank, N.A.").toLowerCase(), "WELLS");

        mapc.set(String("Litton Loan Servicing L.P.").toLowerCase(), "SQ2");
        mapc.set(String("CitiMortgage Inc.").toLowerCase(), "SQ2");
        mapc.set(String("Chase Manhattan Mortgage Corporation").toLowerCase(), "Aa3");
        mapc.set(String("Boston Safe Deposit & Trust").toLowerCase(), "Aa3");
        mapc.set(String("Residential Funding Corp (RFC)").toLowerCase(), "");
        mapc.set(String("Bank of America, N.A.").toLowerCase(), "SQ1");
        mapc.set(String("Morgan Stanley").toLowerCase(), "Aa3");
        mapc.set(String("Wells Fargo Bank, N.A.").toLowerCase(), "Aa3");

        mapd.set(String("Litton Loan Servicing L.P.").toLowerCase(), "Strong");
        mapd.set(String("CitiMortgage Inc.").toLowerCase(), "Strong");
        mapd.set(String("Chase Manhattan Mortgage Corporation").toLowerCase(), "Strong");
        mapd.set(String("Boston Safe Deposit & Trust").toLowerCase(), "AA-");
        mapd.set(String("Residential Funding Corp (RFC)").toLowerCase(), "Strong");
        mapd.set(String("Bank of America, N.A.").toLowerCase(), "Strong");
        mapd.set(String("Morgan Stanley").toLowerCase(), "Above Average");
        mapd.set(String("Wells Fargo Bank, N.A.").toLowerCase(), "Above Average");

        //ranking
        var sorted = rankarr.slice().sort(function (a, b) { return b - a })
        var ranks = rankarr.map(function (v) { return sorted.indexOf(v) + 1 });
        for (var i = 0; i < ranks.length; ++i) {
            rankmap.set(String(ranks[i]), String(rankarr[i]));
        }

        //4th table
        wal = parseFloat(parseFloat(wal) / parseFloat(totalcurrentrmbs));
        rec = parseFloat(parseFloat(rec) / parseFloat(totalcurrentrmbs) * 100);

        //totals
        console.log("num1:::: " + num1);
        console.log("deno1:::: "+ deno1);
        totalwarf = parseFloat(parseFloat(num1) / parseFloat(deno1)).toFixed(2);
        console.log("totalwarf:: "+ String(totalwarf));
        if(String(totalwarf).toLowerCase() == "nan"){
            totalwarf = 0;
        }

        //weighted average
        wghtavgrecoveryratemoody = parseFloat(parseFloat(wghtavgrecoveryratemoody) / parseFloat(totalprinicpalbal)).toFixed(2);
        wghtavgsprec = parseFloat(parseFloat(wghtavgsprec) / parseFloat(totalprinicpalbal)).toFixed(2);
        wghtavgcalamt = parseFloat(parseFloat(wghtavgcalamt) / parseFloat(totalprinicpalbal)).toFixed(2);
        wghtavgabswalbasecase = parseFloat(parseFloat(wghtavgabswalbasecase) / parseFloat(totalprinicpalbal)).toFixed(2);

        //find max
        if (parseFloat(totalmcohaircut) > parseFloat(totalsphaircut)) {
            var max = parseFloat(totalmcohaircut).toFixed(2);
        } else {
            var max = parseFloat(totalsphaircut).toFixed(2);
        }

        //3rd b table
        for (var i = 0; i < headingarr.length; ++i) {
            var temp3 = 0;
            issuemapheading.forEach((values, keys) => {
                if (String(keys).toLowerCase().includes(String(headingarr[i]).toLowerCase())) {
                    temp3 = parseFloat(temp3) + parseFloat(values);
                }
            });
            finalheadingmap.set(headingarr[i], temp3);
        }

        for (var i = 0; i < headingarr.length; ++i) {
            if (String(headingarr[i]).toLowerCase().includes("semt")) {
                semt1map.set(headingarr[i], finalheadingmap.get(headingarr[i]));
            } else {
                semt1map.set(headingarr[i], 0);
            }
        }

        for (var i = 0; i < headingarr.length; ++i) {
            if (!String(headingarr[i]).toLowerCase().includes("semt")) {
                semt2map.set(headingarr[i], finalheadingmap.get(headingarr[i]));
            } else {
                semt2map.set(headingarr[i], 0);
            }
        }

        var rankarrtemp = [];
        semt2map.forEach((values, keys) => {
            rankarrtemp.push(values);
        });

        if ((inputmonth != 11 && inputyear != 2021) && (inputmonth != 1 && inputyear != 2022)) {
            console.log("inside if rank");
            //rankresponse
            if (rankmap.has("1")) {
                rankresarr.push(rankmap.get("1"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("2")) {
                rankresarr.push(rankmap.get("2"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("3")) {
                rankresarr.push(rankmap.get("3"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("4")) {
                rankresarr.push(rankmap.get("4"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("5")) {
                rankresarr.push(rankmap.get("5"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("6")) {
                rankresarr.push(rankmap.get("6"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("7")) {
                rankresarr.push(rankmap.get("7"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("8")) {
                rankresarr.push(rankmap.get("8"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("9")) {
                rankresarr.push(rankmap.get("9"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("10")) {
                rankresarr.push(rankmap.get("10"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("11")) {
                rankresarr.push(rankmap.get("11"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("12")) {
                rankresarr.push(rankmap.get("12"));
            } else {
                rankresarr.push("0");
            }
        } else {
            rankmap = new Map();
            var sortedtemp = rankarrtemp.slice().sort(function (a, b) { return b - a })
            var rankstemp = rankarrtemp.map(function (v) { return sortedtemp.indexOf(v) + 1 });
            for (var i = 0; i < rankstemp.length; ++i) {
                rankmap.set(String(rankstemp[i]), String(rankarrtemp[i]));
            }
            //rankresponse
            if (rankmap.has("1")) {
                rankresarr.push(rankmap.get("1"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("2")) {
                rankresarr.push(rankmap.get("2"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("3")) {
                rankresarr.push(rankmap.get("3"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("4")) {
                rankresarr.push(rankmap.get("4"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("5")) {
                rankresarr.push(rankmap.get("5"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("6")) {
                rankresarr.push(rankmap.get("6"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("7")) {
                rankresarr.push(rankmap.get("7"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("8")) {
                rankresarr.push(rankmap.get("8"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("9")) {
                rankresarr.push(rankmap.get("9"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("10")) {
                rankresarr.push(rankmap.get("10"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("11")) {
                rankresarr.push(rankmap.get("11"));
            } else {
                rankresarr.push("0");
            }
            if (rankmap.has("12")) {
                rankresarr.push(rankmap.get("12"));
            } else {
                rankresarr.push("0");
            }
        }




        mapb.forEach((values, keys) => {
            if (String(values).toLowerCase() == "washington") {
                b1 = mapa.get(keys);
            }
            if (String(values).toLowerCase() == "chase") {
                b2 = mapa.get(keys);
            }
            if (String(values).toLowerCase() == "wells") {
                b3 = mapa.get(keys);
            }
        });

        mapd.forEach((values, keys) => {
            if (String(values).toLowerCase() == "strong") {
                sval = parseFloat(parseFloat(sval) + parseFloat(mapa.get(keys))).toFixed(2);
            }

        });

        //new tables
        var mapearr = [];
        mapd.forEach((values, keys) => {
            if (String(values).toLowerCase() == "strong") {
                mape.set(keys, mapa.get(keys));
                mapearr.push(mapa.get(keys));
            } else {
                mape.set(keys, 0);
                mapearr.push(0);
            }
        });

        console.log(mapearr);
        let rankmape = new Map();
        var sortedmapearr = mapearr.slice().sort(function (a, b) { return b - a })
        var ranksmapearr = mapearr.map(function (v) { return sortedmapearr.indexOf(v) + 1 });
        for (var i = 0; i < ranksmapearr.length; ++i) {
            rankmape.set(String(ranksmapearr[i]), String(mapearr[i]));
        }

        var tempe = 0;
        console.log(rankmape);
        rankmape.forEach((values, keys) => {
            if(parseInt(keys) <= 2){
                tempe = parseFloat(tempe) + parseFloat(values);
            }
        });

        console.log("tempe::: "+ tempe);
        compres.push(b1);
        compres.push(b2);
        compres.push(b3);

        if(String(fixedc).toLowerCase() == "nan"){
            fixedc = 0;
        }
        if(String(floatingc).toLowerCase() == "nan"){
            floatingc = 0;
        }
        if(String(wal).toLowerCase() == "nan"){
            wal = 0;
        }
        if(String(rec).toLowerCase() == "nan"){
            rec = 0;
        }

        console.log("before fixedc::: "+ fixedc);
        if (inputmonth == 12 || (inputmonth == 1) && inputyear == 2022) {
            response.push(parseFloat(totalbalancermbs).toFixed(2));//0
        } else {
            response.push(currentrmbs);//0
        }
        response.push(parseFloat(calamtrmbs).toFixed(2));//1
        response.push(max);//2
        response.push(totalwarf);//3
        if(inputmonth == 1 && inputyear == 2022){
            fixedd = "2.594";
            response.push(fixedd);//4
        }else{
        response.push(fixedc);//4
        }
        response.push(floatingc);//5
        response.push(wal);//6
        response.push(rec);//7
        response.push(issuetotala);//8
        response.push(totalbalancermbs);//9
        response.push(parseFloat(fixeda).toFixed(2));//10
        response.push(parseFloat(floatinga).toFixed(2));//11
        response.push(rankresarr);//12
        response.push(compres);//13
        if(inputmonth == 12 || (inputmonth == 1) && inputyear == 2022){
            response.push(tempe);//14
        }else{
            response.push(sval);//14
        }
        response.push(balancermbs);//15
        response.push(mapa.get(String("Residential Funding Corp (RFC)").toLowerCase()));//16
        response.push(mapc);//17
        response.push(mapd);//18
        if (inputmonth == 12 || (inputmonth == 1) && inputyear == 2022) {
            response.push(totaldefaultedrmbs);//19
            response.push(totalcalamtrmbs);//20
        } else {
            response.push("0");//19
            response.push("0");//20  
        }
        response.push(currentrmbs);//21

        console.log(JSON.stringify(response));

        return response;


    }
}
module.exports = servicertable;
