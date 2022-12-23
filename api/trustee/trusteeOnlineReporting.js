var request = require('request');
//const uuidv4 = require('uuid/v4');
const fabricURL = process.env.charlesFortfabricURL;
let nodemailer = require("nodemailer");
const uuidv4 = require('uuid/v4');
const EventEmitter = require('events');
var toLowerCase = require('to-lower-case');
var log4js = require("log4js");
var logger = log4js.getLogger();
var contains = require("string-contains");
logger.level = "debug";

var reportstatus = {

    getinvhistory: function (req, res, next) {

        logger.debug(req.query.dealId);

        if (!req.query.dealId || !req.query.peer || !req.query.token || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {


            var month;
            var year;

            if (parseInt(req.query.month) == 1) {
                month = "12";
                year = String(parseInt(req.query.year) - 1);

            }
            else {
                month = String(parseInt(req.query.month) - 1);
                year = req.query.year;
            }

            var getData = {
                peer: req.query.peer,
                fcn: "GetHistoryOfInvestorReport",
                args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                //token: req.query.token
            };
            logger.debug("getDataaa++++++" + JSON.stringify(getData));
            request.get({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + req.query.token
                }

            },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // logger.debug("length--------" + body);

                        if (body.length > 2) {
                            //console.log("res:::"+JSON.stringify(body));
                            var response = JSON.parse(body);
                            console.log("res:::" + JSON.stringify(response));

                            var finalres = [];


                            var arr1 = response[0];
                            var arr2 = response[1];
                            var arr3 = response[2];
                            var arr4 = response[3];

                            //console.log("arr2:::"+JSON.stringify(arr2));


                            var arr1 = response[0];
                            var arr2 = response[1];
                            var arr3 = response[2];
                            var arr4 = response[3];

                            //define arrays
                            for (var i = 0; i < response.length; ++i) {
                                var irData = response[i][0].irData;
                                var indexBegin = irData.indexOf("{");
                                var indexEnd = irData.lastIndexOf("}");
                                var temp = irData.substring(indexBegin, indexEnd + 1);
                                var tempStr = temp.replace(/'/g, "\"");
                                var priorinvestorreport = {};
                                priorinvestorreport = JSON.parse(tempStr);
                                //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                    arr2 = response[i];
                                } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                    arr3 = response[i];
                                } else if (priorinvestorreport.hasOwnProperty("DealContactInformation")) {
                                    arr1 = response[i];
                                } else if (priorinvestorreport.hasOwnProperty("PriorityOfPayments")) {
                                    arr4 = response[i];
                                }

                            }


                            for (var j = 0; j < arr1.length; ++j) {

                                var finaljson = {};
                                var finalir = {};

                                //1st arr
                                var arrt1 = [];
                                var arrt2 = [];

                                console.log("irid:::" + JSON.stringify(arr1[j].irId));
                                var irData = arr1[j].irData;
                                var indexBegin = irData.indexOf("{");
                                var indexEnd = irData.lastIndexOf("}");
                                var temp = irData.substring(indexBegin, indexEnd + 1);
                                var tempStr = temp.replace(/'/g, "\"");
                                var priorinvestorreport = {};
                                priorinvestorreport = JSON.parse(tempStr);
                                //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                for (var key in priorinvestorreport) {
                                    var temp = JSON.stringify(priorinvestorreport[key]);
                                    //replaceAll(temp,"Moodys","Moody's");

                                    temp = temp.replace(/Moodys/g, "Moody's");

                                    temp = temp.replace(/S&Ps/g, "S&P's");

                                    temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                    temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                    temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                    finaljson[key] = JSON.parse(temp);
                                }

                                //4th arr
                                var arrt1 = [];
                                var arrt2 = [];

                                console.log("irid:::" + JSON.stringify(arr4[j].irId));
                                var irData = arr4[j].irData;
                                var indexBegin = irData.indexOf("{");
                                var indexEnd = irData.lastIndexOf("}");
                                var temp = irData.substring(indexBegin, indexEnd + 1);
                                var tempStr = temp.replace(/'/g, "\"");
                                var priorinvestorreport = {};
                                priorinvestorreport = JSON.parse(tempStr);
                                //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                for (var key in priorinvestorreport) {
                                    console.log("key:::::::" + JSON.stringify(key));
                                    var temp = JSON.stringify(priorinvestorreport[key]);
                                    //replaceAll(temp,"Moodys","Moody's");

                                    temp = temp.replace(/Moodys/g, "Moody's");

                                    temp = temp.replace(/S&Ps/g, "S&P's");

                                    temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                    temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                    temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                    finaljson[key] = JSON.parse(temp);
                                }

                                //2nd and 3rd arr
                                var arrt1 = [];
                                var arrt2 = [];

                                console.log("irid:::" + JSON.stringify(arr2[j].irId));
                                var irData = arr2[j].irData;
                                var indexBegin = irData.indexOf("{");
                                var indexEnd = irData.lastIndexOf("}");
                                var temp = irData.substring(indexBegin, indexEnd + 1);
                                var tempStr = temp.replace(/'/g, "\"");
                                var priorinvestorreport = {};
                                priorinvestorreport = JSON.parse(tempStr);

                                arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];

                                console.log("irid:::arr3:::::" + JSON.stringify(arr3[j].irId));
                                var irData = arr3[j].irData;
                                var indexBegin = irData.indexOf("{");
                                var indexEnd = irData.lastIndexOf("}");
                                var temp = irData.substring(indexBegin, indexEnd + 1);
                                var tempStr = temp.replace(/'/g, "\"");
                                var priorinvestorreport = {};
                                priorinvestorreport = JSON.parse(tempStr);

                                arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1'];

                                var farr = [];

                                arrt1 = arrt1.concat(arrt2);
                                console.log("arrt1:::" + JSON.stringify(arrt1));

                                for (var key in arrt1) {
                                    var temptest = JSON.stringify(arrt1[key]);

                                    temptest = temptest.replace(/Moodys/g, "Moody's");

                                    temptest = temptest.replace(/S and P/g, "S&P");

                                    farr[key] = JSON.parse(temptest);
                                }

                                var farr1 = [];
                                if (req.query.month == 9) {
                                    farr1.push(farr[0]);
                                } else {
                                    farr1 = farr;
                                }
                                finaljson['PortfolioRequirementsTestsSummary'] = farr1;

                                if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                                    delete finaljson['Payments'];
                                    delete finaljson['Factors'];
                                    delete finaljson['PriorityOfPayments'];
                                    //Continues for every month 
                                }
                                if (parseInt(req.query.month) == 9 && parseInt(req.query.year) == 2022) {
                                    var testSummaryJson = [{
                                        "Test": "",
                                        "Result": "",
                                        "Current": "",
                                        "Numerator": "",
                                        "Denominator": "",
                                        "Minimum": "",
                                        "Maximum": ""
                                      }]

                                      finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;
                                    delete finaljson['Payments'];
                                    delete finaljson['Factors'];
                                    delete finaljson['PriorityOfPayments'];
                                } 
                                if (parseInt(req.query.month) == 10 && parseInt(req.query.year) == 2022) {
                                    var testSummaryJson = [{
                                        "Test": "",
                                        "Result": "",
                                        "Current": "",
                                        "Numerator": "",
                                        "Denominator": "",
                                        "Minimum": "",
                                        "Maximum": ""
                                      }]

                                      finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                                    }
                                finalir['irId'] = arr1[j].irId;
                                finalir['irData'] = finaljson;
                                finalir['irHash'] = arr1[j].irHash;
                                finalir['irMonth'] = arr1[j].irMonth;
                                finalir['irYear'] = arr1[j].irYear;
                                finalir['irUpdatedBy'] = arr1[j].irUpdatedBy;
                                finalir['irUpdationDate'] = arr1[j].irUpdationDate;
                                finalir['irDealId'] = arr1[j].irDealId;
                                finalir['irVersion'] = arr1[j].irVersion;

                                finalres.push(finalir);

                            }

                            console.log("final:::" + JSON.stringify(finalres));

                            forloopfun(finalres);
                        }
                        else {
                            var arr = [];
                            res.send(arr);
                        }
                    }
                    else {
                        // logger.debug(response.statusCode + response.body);
                        res.send({ token: -1 });
                    }
                });
        }

        function forloopfun(response) {

            //logger.debug("res:   " + JSON.stringify(response));
            // logger.debug("\n version:  " + response[response.length - 1].irVersion);

            response[response.length - 1].irVersion = response[response.length - 1].irVersion + " - LATEST";

            //logger.debug("\n version after :  " + response[response.length - 1].irVersion);
            
            for (var i = 0; i < response.length; i++) {
                response[i]["irCreatedDate"] = response[i].irUpdationDate;
                response[i]["irCreatedBy"] = process.env.TrusteeOrgName;
            }
            res.send(response);
        }

    },

    getinvreportresponse: function (req, res, next) {

        if (!req.query.dealId || !req.query.peer || !req.query.token || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var month = req.query.month;
            var year = req.query.year;
            var priorinvestorreport = {};
            var emitfinal = new EventEmitter();

            if (parseInt(req.query.month) == 1) {
                month = "12";
                year = String(parseInt(req.query.year) - 1);

            }
            else {
                month = String(parseInt(req.query.month) - 1);
                year = req.query.year;
            }



            var getData = {
                peer: req.query.peer,
                fcn: "GetInvestorReportByMonthAndYear",
                args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
            };
            logger.debug("getDataaa++++++" + JSON.stringify(getData));
            request.get({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + req.query.token
                }

            },
                function (error, response, body) {
                    //logger.debug("length--------" + body);
                    if (!error && response.statusCode == 200) {
                        //logger.debug("length--------" + body.length);

                        if (body.length > 0) {
                            response = JSON.parse(body);

                            var finaljson = {};
                            var arr1 = [];
                            var arr2 = [];
                            var arr = [];

                            //logger.debug("priorinvestorreport:::" + (JSON.stringify(response)));
                            console.log(response.length);

                            for (var i = 0; i < response.length; ++i) {
                                var irData = response[i].irData;
                                var indexBegin = irData.indexOf("{");
                                var indexEnd = irData.lastIndexOf("}");
                                var temp = irData.substring(indexBegin, indexEnd + 1);
                                var tempStr = temp.replace(/'/g, "\"");
                                var priorinvestorreport = {};
                                priorinvestorreport = JSON.parse(tempStr);
                                //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                    arr1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];
                                } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                    arr2 = priorinvestorreport['PortfolioRequirementsTestsSummary1']
                                } else {
                                    for (var j in priorinvestorreport) {
                                        console.log(j + "    " + priorinvestorreport[j]);

                                        var temp = JSON.stringify(priorinvestorreport[j]);
                                        //replaceAll(temp,"Moodys","Moody's");

                                        temp = temp.replace(/Moodys/g, "Moody's");

                                        temp = temp.replace(/S&Ps/g, "S&P's");

                                        temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                        temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                        temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                        finaljson[j] = JSON.parse(temp);
                                    }
                                }

                            }

                            arr1 = arr1.concat(arr2);
                            var farr = [];

                            for (var key in arr1) {
                                var temptest = JSON.stringify(arr1[key]);

                                temptest = temptest.replace(/Moodys/g, "Moody's");

                                temptest = temptest.replace(/S and P/g, "S&P");

                                farr[key] = JSON.parse(temptest);
                            }

                            var farr1 = [];

                                farr1 = farr;
                            finaljson['PortfolioRequirementsTestsSummary'] = farr1;

                            if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                                delete finaljson['Payments'];
                                delete finaljson['Factors'];
                                delete finaljson['PriorityOfPayments'];
                            }

                            if (parseInt(req.query.month) == 9 && parseInt(req.query.year) == 2022) {
                                var testSummaryJson = [{
                                    "Test": "",
                                    "Result": "",
                                    "Current": "",
                                    "Numerator": "",
                                    "Denominator": "",
                                    "Minimum": "",
                                    "Maximum": ""
                                  }]

                                  finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                                delete finaljson['Payments'];
                                delete finaljson['Factors'];
                                delete finaljson['PriorityOfPayments'];
                            }  
                            if (parseInt(req.query.month) == 10 && parseInt(req.query.year) == 2022) {
                                var testSummaryJson = [{
                                    "Test": "",
                                    "Result": "",
                                    "Current": "",
                                    "Numerator": "",
                                    "Denominator": "",
                                    "Minimum": "",
                                    "Maximum": ""
                                  }]

                                  finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                             
                            }                           

                            console.log(JSON.stringify(finaljson));

                            for (var key in finaljson) {
                                var json = {
                                    "id": uuidv4().toString(),
                                    "content": key,
                                    "data": finaljson[key]
                                }
                                arr.push(json);
                            }

                            res.send(arr);
                        }
                        else {
                            var arr = [];
                            res.send(arr);
                        }

                    } else {
                        res.send({ token: -1 });
                    }
                });
        }
    },

    savecustomreport: function (req, res, next) {


        if (!req.body.dealId || !req.body.peers || !req.body.token || !req.body.month || !req.body.year || !req.body.input) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var month = "";
            var year = "";
            var irId = "";
            var data_present = 0;

            if (parseInt(req.body.month) == 1) {
                month = "12";
                year = String(parseInt(req.body.year) - 1);
            }
            else {
                month = String(parseInt(req.body.month) - 1);
                year = req.body.year;
            }

            var getData = {
                peer: req.body.peers[0],
                fcn: "GetCustomReportByDealIdMonthAndYear",
                args: '[\"' + toLowerCase(req.body.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                //token: req.query.token
            };
            logger.debug("getDataaa++++++" + JSON.stringify(getData));
            request.get({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortCustomReportCC + '?' + require('querystring').stringify(getData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + req.body.token
                }

            },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.debug("length--------" + body.length + "     " + body);

                        if (body.length > 2) {

                            response = JSON.parse(body);
                            logger.debug("Length of res:" + response.length);
                            if (response.length > 0) {
                                irId = response[0].ID;
                                data_present = 1;
                                logger.debug("inside if if: " + irId);
                                savereport();
                            }
                            else {
                                irId = uuidv4().toString();
                                logger.debug("inside if else ");
                                savereport();
                            }
                        }
                        else {
                            irId = uuidv4().toString();
                            logger.debug("inside else ");
                            savereport();
                        }

                    } else {
                        res.send({ token: -1 });
                    }
                });


            function savereport() {

                var postData = {
                    peers: req.body.peers,
                    fcn: "SaveCustomReport",
                    args: [irId, toLowerCase(req.body.dealId), month, year, JSON.stringify(req.body.input)]
                };
                logger.debug("Post Data:::::::" + JSON.stringify(postData));
                request.post({
                    uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortCustomReportCC,
                    headers: {
                        'content-type': 'application/json',
                        'authorization': 'Bearer ' + req.body.token
                    },
                    body: JSON.stringify(postData)
                },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            response = JSON.parse(body);
                            if (response.success == true) {
                                if (data_present == 0) {
                                    res.send({ "isSuccess": true, "message": "Data Saved" });
                                }
                                else if (data_present == 1) {
                                    res.send({ "isSuccess": true, "message": "Data Updated" });
                                }
                            }
                            else {
                                res.send({ "isSuccess": false, "message": "Data not saved!!" });
                            }

                        } else {
                            logger.debug(response.statusCode + response.body);
                            res.send({ token: -1 });
                        }
                    });
            }
        }
    },

    viewcustomreport: function (req, res, next) {

        if (!req.query.dealId || !req.query.peer || !req.query.token || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var month = "";
            var year = "";

            if (parseInt(req.query.month) == 1) {
                month = "12";
                year = String(parseInt(req.query.year) - 1);
            }
            else {
                month = String(parseInt(req.query.month) - 1);
                year = req.query.year;
            }

            var getData = {
                peer: req.query.peer,
                fcn: "GetInvestorReportByMonthAndYear",
                args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
            };
            logger.debug("getDataaa++++++" + JSON.stringify(getData));
            request.get({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + req.query.token
                }

            },
                function (error, response, body) {
                    //logger.debug("length--------" + body);
                    if (!error && response.statusCode == 200) {
                        //logger.debug("length--------" + body);

                        if (body.length > 2) {
                            response = JSON.parse(body);

                            var finaljson = {};
                            var arr1 = [];
                            var arr2 = [];

                            logger.debug("priorinvestorreport:::" + (JSON.stringify(response)));
                            console.log(response.length);

                            for (var i = 0; i < response.length; ++i) {
                                var irData = response[i].irData;
                                var indexBegin = irData.indexOf("{");
                                var indexEnd = irData.lastIndexOf("}");
                                var temp = irData.substring(indexBegin, indexEnd + 1);
                                var tempStr = temp.replace(/'/g, "\"");
                                var priorinvestorreport = {};
                                priorinvestorreport = JSON.parse(tempStr);
                                //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                    arr1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];
                                } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                    arr2 = priorinvestorreport['PortfolioRequirementsTestsSummary1']

                                } else {
                                    for (var j in priorinvestorreport) {
                                        console.log(JSON.stringify(priorinvestorreport[j]));

                                        var temp = JSON.stringify(priorinvestorreport[j]);
                                        //replaceAll(temp,"Moodys","Moody's");

                                        temp = temp.replace(/Moodys/g, "Moody's");

                                        temp = temp.replace(/S&Ps/g, "S&P's");

                                        temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                        temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                        temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                        finaljson[j] = JSON.parse(temp);
                                    }
                                }

                            }

                            arr1 = arr1.concat(arr2);

                            var farr = [];

                            for (var key in arr1) {
                                var temptest = JSON.stringify(arr1[key]);

                                temptest = temptest.replace(/Moodys/g, "Moody's");

                                temptest = temptest.replace(/S and P/g, "S&P");

                                farr[key] = JSON.parse(temptest);
                            }

                            console.log("farr:::" + JSON.stringify(farr));
                            var farr1 = [];

                                farr1 = farr;
                            finaljson['PortfolioRequirementsTestsSummary'] = farr1;

                            if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                                delete finaljson['Payments'];
                                delete finaljson['Factors'];
                                delete finaljson['PriorityOfPayments'];
                            }
                            if (parseInt(req.query.month) == 9 && parseInt(req.query.year) == 2022) {
                                var testSummaryJson = [{
                                    "Test": "",
                                    "Result": "",
                                    "Current": "",
                                    "Numerator": "",
                                    "Denominator": "",
                                    "Minimum": "",
                                    "Maximum": ""
                                  }]

                                  finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                                delete finaljson['Payments'];
                                delete finaljson['Factors'];
                                delete finaljson['PriorityOfPayments'];
                            }
                            if (parseInt(req.query.month) == 10 && parseInt(req.query.year) == 2022) {
                                var testSummaryJson = [{
                                    "Test": "",
                                    "Result": "",
                                    "Current": "",
                                    "Numerator": "",
                                    "Denominator": "",
                                    "Minimum": "",
                                    "Maximum": ""
                                  }]

                                  finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                              
                            }
                            // if (parseInt(req.query.month) == 10 && parseInt(req.query.year) == 2022) {
                            
                            // }
                        
                            finaljson = JSON.stringify(finaljson);

                            console.log("f::::" + finaljson);

                            setTimeout(function () {
                                customreportquery(finaljson);
                            }, 300)

                        }
                        else {
                            // var arr = [];
                            // res.send(arr);
                            res.sendStatus(204);
                        }

                    } else {
                        res.send({ token: -1 });
                    }
                });


            function customreportquery(priorinvestorreport) {

                var getData = {
                    peer: req.query.peer,
                    fcn: "GetCustomReportByDealIdMonthAndYear",
                    args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                };
                logger.debug("getDataaa++++++" + JSON.stringify(getData));
                request.get({
                    uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortCustomReportCC + '?' + require('querystring').stringify(getData),
                    headers: {
                        'content-type': 'application/json',
                        'authorization': 'Bearer ' + req.query.token
                    }

                },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            logger.debug("length--------" + body.length + "     " + body);

                            if (body.length > 2) {

                                response = JSON.parse(body);
                                //logger.debug("Length of response:" + JSON.stringify(response) + "   " + response.length);
                                if (response.length > 0) {
                                    response = JSON.parse(response[0].Page);
                                    aligningfunction(priorinvestorreport, response);
                                    // logger.debug("inside else!!!!***");
                                    // var output = { "isSuccess": false };
                                    // console.log("output::::" + output);
                                    // res.send(output);
                                }
                                else {
                                    logger.debug("inside else!!!!***");
                                    var output = { "isSuccess": false };
                                    console.log("output::::" + output);
                                    res.send(output);
                                }
                            }
                            else {
                                logger.debug("inside else!!!!***");
                                var output = { "isSuccess": false };
                                console.log("output::::" + output);
                                res.send(output);
                            }

                        } else {
                            res.send({ token: -1 });
                        }
                    });
            }

            function aligningfunction(priorinvestorreport, customreport) {

                //logger.debug("priorinvestorreport: ++++++++++++ \n" + priorinvestorreport);
                //logger.debug("custom report: +++++++++++ " + JSON.stringify(customreport));

                priorinvestorreport = JSON.parse(priorinvestorreport);
                // Object.keys(priorinvestorreport).forEach(function (key) {
                //     console.log("k::::::"+key);
                // })

                Object.keys(customreport).forEach(function (key) {

                    if (customreport[key].class != "static_table") {

                        for (var c = 0; c < customreport[key].items.length; c++) {

                            // logger.debug(customreport[key].items[c].content + "---------------");

                            var k = customreport[key].items[c].content;
                            console.log("d:::::::");
                            console.log(JSON.stringify(priorinvestorreport[k]));
                            customreport[key].items[c].data = priorinvestorreport[customreport[key].items[c].content];
                        }

                    }
                })

                if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                    Object.keys(customreport).forEach(function (key) {

                        if (customreport[key].class != "static_table") {

                            for (var c = 0; c < customreport[key].items.length; c++) {

                                //logger.debug(customreport[key].items[c].content + "---------------");

                                if (String(customreport[key].items[c].content) == "Payments" || String(customreport[key].items[c].content) == "Factors"
                                    || String(customreport[key].items[c].content) == "PriorityOfPayments") {
                                    console.log("inside if");
                                    //customreport[key].items[c];
                                    customreport[key].items.splice(c, 1);
                                    --c;
                                }

                            }

                        }
                    })

                }

                // if(req.query.month == 8){
                //     customreport['Date'] = priorinvestorreport['Date'];
                // }

                console.log("customreport:::::" + JSON.stringify(customreport));

                setTimeout(function () { res.send(customreport); }, 300);
            }
        }
    },

    viewinvestorreport: function (req, res, next) {

        if (!req.query.peer || !req.query.token || !req.query.role || !req.query.dealId || !req.query.month || !req.query.year || !req.query.version) {

            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            var DealPublishCCEmitter = new EventEmitter();

            var Role = req.query.role;

            var month = "";
            var year = "";

            if (parseInt(req.query.month) == 1) {
                month = "12";
                year = String(parseInt(req.query.year) - 1);
            }
            else {
                month = String(parseInt(req.query.month) - 1);
                year = req.query.year;
            }


            //check for the role
            if (Role.equalsIgnoreCase(process.env.TrusteeOrgName)) {

                //if trsutee,then can view the report even if the status of the report =0
                var getData = {
                    peer: req.query.peer,
                    fcn: "GetHistoryOfInvestorReport",
                    args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                };
                logger.debug("getDataaa++++++" + JSON.stringify(getData));
                request.get({
                    uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getData),
                    headers: {
                        'content-type': 'application/json',
                        'authorization': 'Bearer ' + req.query.token
                    }

                },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            logger.debug("length--------" + body.length);

                            if (body.length > 2) {
                                response = JSON.parse(body);


                                var finalres = [];


                                var arr1 = response[0];
                                var arr2 = response[1];
                                var arr3 = response[2];
                                var arr4 = response[3];

                                //define arrays
                                for (var i = 0; i < response.length; ++i) {
                                    var irData = response[i][0].irData;
                                    var indexBegin = irData.indexOf("{");
                                    var indexEnd = irData.lastIndexOf("}");
                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                    var tempStr = temp.replace(/'/g, "\"");
                                    var priorinvestorreport = {};
                                    priorinvestorreport = JSON.parse(tempStr);
                                    //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                    if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                        arr2 = response[i];
                                    } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                        arr3 = response[i];
                                    } else if (priorinvestorreport.hasOwnProperty("DealContactInformation")) {
                                        arr1 = response[i];
                                    } else if (priorinvestorreport.hasOwnProperty("PriorityOfPayments")) {
                                        arr4 = response[i];
                                    }

                                }


                                for (var j = 0; j < arr1.length; ++j) {

                                    var finaljson = {};
                                    var finalir = {};

                                    //1st arr
                                    var arrt1 = [];
                                    var arrt2 = [];

                                    console.log("irid:::" + JSON.stringify(arr1[j].irId));
                                    var irData = arr1[j].irData;
                                    var indexBegin = irData.indexOf("{");
                                    var indexEnd = irData.lastIndexOf("}");
                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                    var tempStr = temp.replace(/'/g, "\"");
                                    var priorinvestorreport = {};
                                    priorinvestorreport = JSON.parse(tempStr);
                                    //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                    for (var key in priorinvestorreport) {
                                        var temp = JSON.stringify(priorinvestorreport[key]);
                                        //replaceAll(temp,"Moodys","Moody's");

                                        temp = temp.replace(/Moodys/g, "Moody's");

                                        temp = temp.replace(/S&Ps/g, "S&P's");

                                        temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                        temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                        temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                        finaljson[key] = JSON.parse(temp);
                                    }

                                    //4th arr
                                    var arrt1 = [];
                                    var arrt2 = [];

                                    console.log("irid:::" + JSON.stringify(arr4[j].irId));
                                    var irData = arr4[j].irData;
                                    var indexBegin = irData.indexOf("{");
                                    var indexEnd = irData.lastIndexOf("}");
                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                    var tempStr = temp.replace(/'/g, "\"");
                                    var priorinvestorreport = {};
                                    priorinvestorreport = JSON.parse(tempStr);
                                    //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                    for (var key in priorinvestorreport) {
                                        var temp = JSON.stringify(priorinvestorreport[key]);
                                        //replaceAll(temp,"Moodys","Moody's");

                                        temp = temp.replace(/Moodys/g, "Moody's");

                                        temp = temp.replace(/S&Ps/g, "S&P's");

                                        temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                        temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                        temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                        finaljson[key] = JSON.parse(temp);
                                    }

                                    //2nd and 3rd arr
                                    var arrt1 = [];
                                    var arrt2 = [];

                                    console.log("irid:::" + JSON.stringify(arr2[j].irId));
                                    var irData = arr2[j].irData;
                                    var indexBegin = irData.indexOf("{");
                                    var indexEnd = irData.lastIndexOf("}");
                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                    var tempStr = temp.replace(/'/g, "\"");
                                    var priorinvestorreport = {};
                                    priorinvestorreport = JSON.parse(tempStr);

                                    arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];

                                    console.log("irid:::" + JSON.stringify(arr3[j].irId));
                                    var irData = arr3[j].irData;
                                    var indexBegin = irData.indexOf("{");
                                    var indexEnd = irData.lastIndexOf("}");
                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                    var tempStr = temp.replace(/'/g, "\"");
                                    var priorinvestorreport = {};
                                    priorinvestorreport = JSON.parse(tempStr);

                                    arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1'];

                                    var farr = [];

                                    arrt1 = arrt1.concat(arrt2);

                                    for (var key in arrt1) {
                                        var temptest = JSON.stringify(arrt1[key]);

                                        temptest = temptest.replace(/Moodys/g, "Moody's");

                                        temptest = temptest.replace(/S and P/g, "S&P");

                                        farr[key] = JSON.parse(temptest);
                                    }

                                    var farr1 = [];

                                        farr1 = farr;
                                    finaljson['PortfolioRequirementsTestsSummary'] = farr1;

                                    if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                                        delete finaljson['Payments'];
                                        delete finaljson['Factors'];
                                        delete finaljson['PriorityOfPayments'];
                                    }
                                    if (parseInt(req.query.month) == 9 && parseInt(req.query.year) == 2022) {
                                        var testSummaryJson = [{
                                            "Test": "",
                                            "Result": "",
                                            "Current": "",
                                            "Numerator": "",
                                            "Denominator": "",
                                            "Minimum": "",
                                            "Maximum": ""
                                          }]

                                          finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                                        delete finaljson['Payments'];
                                        delete finaljson['Factors'];
                                        delete finaljson['PriorityOfPayments'];
                                    }
                                    if (parseInt(req.query.month) == 10 && parseInt(req.query.year) == 2022) {
                                        var testSummaryJson = [{
                                            "Test": "",
                                            "Result": "",
                                            "Current": "",
                                            "Numerator": "",
                                            "Denominator": "",
                                            "Minimum": "",
                                            "Maximum": ""
                                          }]

                                          finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                                    }
                                    finalir['irId'] = arr1[j].irId;
                                    finalir['irData'] = finaljson;
                                    finalir['irHash'] = arr1[j].irHash;
                                    finalir['irMonth'] = arr1[j].irMonth;
                                    finalir['irYear'] = arr1[j].irYear;
                                    finalir['irUpdatedBy'] = arr1[j].irUpdatedBy;
                                    finalir['irUpdationDate'] = arr1[j].irUpdationDate;
                                    finalir['irDealId'] = arr1[j].irDealId;
                                    finalir['irVersion'] = arr1[j].irVersion;

                                    finalres.push(finalir);

                                }

                                // for (var j = 0; j < arr1.length; ++j) {

                                //     var finaljson = {};
                                //     var finalir = {};

                                //     //1st json
                                //     var arrt1 = [];
                                //     var arrt2 = [];

                                //     console.log("irid:::" + JSON.stringify(arr1[j].irId));
                                //     var irData = arr1[j].irData;
                                //     var indexBegin = irData.indexOf("{");
                                //     var indexEnd = irData.lastIndexOf("}");
                                //     var temp = irData.substring(indexBegin, indexEnd + 1);
                                //     var tempStr = temp.replace(/'/g, "\"");
                                //     var priorinvestorreport = {};
                                //     priorinvestorreport = JSON.parse(tempStr);
                                //     //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                //     if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                //         console.log("test summary a");
                                //         arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];
                                //     } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                //         console.log("test summary  1a");
                                //         arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1']
                                //     } else {
                                //         for (var key in priorinvestorreport) {
                                //             var temp = JSON.stringify(priorinvestorreport[key]);
                                //             //replaceAll(temp,"Moodys","Moody's");

                                //             temp = temp.replace(/Moodys/g, "Moody's");

                                //             temp = temp.replace(/S&Ps/g, "S&P's");

                                //             temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                //             temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");

                                //             finaljson[key] = JSON.parse(temp);
                                //         }
                                //     }

                                //     if (arrt1.length > 0) {
                                //         arrt1 = arrt1.concat(arrt2);

                                //         var farr = [];

                                //         for (var key in arrt1) {
                                //             var temptest = JSON.stringify(arrt1[key]);

                                //             temptest = temptest.replace(/Moodys/g, "Moody's");

                                //             temptest = temptest.replace(/S and P/g, "S&P");

                                //             farr[key] = JSON.parse(temptest);
                                //         }

                                //         finaljson['PortfolioRequirementsTestsSummary'] = farr;
                                //     }

                                //     //console.log("final:::::**:::"+JSON.stringify(finaljson));

                                //     //2nd json
                                //     var arrt1 = [];
                                //     var arrt2 = [];
                                //     var irData = arr2[j].irData;
                                //     var indexBegin = irData.indexOf("{");
                                //     var indexEnd = irData.lastIndexOf("}");
                                //     var temp = irData.substring(indexBegin, indexEnd + 1);
                                //     var tempStr = temp.replace(/'/g, "\"");
                                //     var priorinvestorreport = {};
                                //     priorinvestorreport = JSON.parse(tempStr);
                                //     //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                //     if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                //         console.log("test summary b");
                                //         arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];
                                //     } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                //         console.log("test summary  1b");
                                //         arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1']
                                //     } else {
                                //         for (var key in priorinvestorreport) {
                                //             var temp = JSON.stringify(priorinvestorreport[key]);
                                //             //replaceAll(temp,"Moodys","Moody's");

                                //             temp = temp.replace(/Moodys/g, "Moody's");

                                //             temp = temp.replace(/S&Ps/g, "S&P's");

                                //             temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                //             temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");

                                //             finaljson[key] = JSON.parse(temp);
                                //         }
                                //     }

                                //     if (arrt1.length > 0) {
                                //         arrt1 = arrt1.concat(arrt2);

                                //         var farr = [];

                                //         for (var key in arrt1) {
                                //             var temptest = JSON.stringify(arrt1[key]);

                                //             temptest = temptest.replace(/Moodys/g, "Moody's");

                                //             temptest = temptest.replace(/S and P/g, "S&P");

                                //             farr[key] = JSON.parse(temptest);
                                //         }

                                //         finaljson['PortfolioRequirementsTestsSummary'] = farr;
                                //     }

                                //     //   console.log("final:::::**:::"+JSON.stringify(finaljson));

                                //     //3rd json
                                //     var arrt1 = [];
                                //     var arrt2 = [];

                                //     var irData = arr3[j].irData;
                                //     var indexBegin = irData.indexOf("{");
                                //     var indexEnd = irData.lastIndexOf("}");
                                //     var temp = irData.substring(indexBegin, indexEnd + 1);
                                //     var tempStr = temp.replace(/'/g, "\"");
                                //     var priorinvestorreport = {};
                                //     priorinvestorreport = JSON.parse(tempStr);
                                //     //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                //     if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                //         console.log("test summary c");
                                //         arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];
                                //     } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                //         console.log("test summary  1c");
                                //         arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1']
                                //     } else {
                                //         for (var key in priorinvestorreport) {
                                //             var temp = JSON.stringify(priorinvestorreport[key]);
                                //             //replaceAll(temp,"Moodys","Moody's");

                                //             temp = temp.replace(/Moodys/g, "Moody's");

                                //             temp = temp.replace(/S&Ps/g, "S&P's");

                                //             temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                //             temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");

                                //             finaljson[key] = JSON.parse(temp);
                                //         }
                                //     }

                                //     if (arrt1.length > 0) {
                                //         arrt1 = arrt1.concat(arrt2);
                                //         var farr = [];

                                //         for (var key in arrt1) {
                                //             var temptest = JSON.stringify(arrt1[key]);

                                //             temptest = temptest.replace(/Moodys/g, "Moody's");

                                //             temptest = temptest.replace(/S and P/g, "S&P");

                                //             farr[key] = JSON.parse(temptest);
                                //         }

                                //         finaljson['PortfolioRequirementsTestsSummary'] = farr;
                                //     }

                                //     //console.log("final:::::**:::"+JSON.stringify(finaljson));

                                //     //4th json
                                //     var arrt1 = [];
                                //     var arrt2 = [];

                                //     var irData = arr4[j].irData;
                                //     var indexBegin = irData.indexOf("{");
                                //     var indexEnd = irData.lastIndexOf("}");
                                //     var temp = irData.substring(indexBegin, indexEnd + 1);
                                //     var tempStr = temp.replace(/'/g, "\"");
                                //     var priorinvestorreport = {};
                                //     priorinvestorreport = JSON.parse(tempStr);
                                //     //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                //     if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                //         console.log("test summary d");
                                //         arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];
                                //     } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                //         console.log("test summary 1d");
                                //         arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1']
                                //     } else {
                                //         for (var key in priorinvestorreport) {
                                //             var temp = JSON.stringify(priorinvestorreport[key]);
                                //             //replaceAll(temp,"Moodys","Moody's");

                                //             temp = temp.replace(/Moodys/g, "Moody's");

                                //             temp = temp.replace(/S&Ps/g, "S&P's");

                                //             temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                //             temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");

                                //             finaljson[key] = JSON.parse(temp);
                                //         }
                                //     }

                                //     if (arrt1.length > 0) {
                                //         arrt1 = arrt1.concat(arrt2);

                                //         var farr = [];

                                //         for (var key in arrt1) {
                                //             var temptest = JSON.stringify(arrt1[key]);

                                //             temptest = temptest.replace(/Moodys/g, "Moody's");

                                //             temptest = temptest.replace(/S and P/g, "S&P");

                                //             farr[key] = JSON.parse(temptest);
                                //         }

                                //         finaljson['PortfolioRequirementsTestsSummary'] = farr;
                                //     }

                                //     //console.log("final:::::**:::"+JSON.stringify(finaljson));

                                //     finalir['irId'] = arr1[j].irId;
                                //     finalir['irData'] = finaljson;
                                //     finalir['irHash'] = arr1[j].irHash;
                                //     finalir['irMonth'] = arr1[j].irMonth;
                                //     finalir['irYear'] = arr1[j].irYear;
                                //     finalir['irUpdatedBy'] = arr1[j].irUpdatedBy;
                                //     finalir['irUpdationDate'] = arr1[j].irUpdationDate;
                                //     finalir['irDealId'] = arr1[j].irDealId;
                                //     finalir['irVersion'] = arr1[j].irVersion;

                                //     finalres.push(finalir);

                                // }//end of for

                                var v = req.query.version;
                                var str = v.split(" ");
                                var version = parseInt(str[1]) - 1;
                                console.log("final:::" + JSON.stringify(finalres));

                                setTimeout(function () {
                                    customreportquery(finalres[version]['irData']);
                                }, 300)

                            }
                            else {
                                // var arr = [];
                                // res.send(arr);
                                res.sendStatus(204);
                            }

                        } else {
                            res.send({ token: -1 });
                        }
                    });
            }

            //if the role is not trustee
            else {

                if (!req.query.userid) {
                    res.status(400).send({ "message": "Missing Arguments!" });
                }
                else {

                    var userid = req.query.userid;
                    var getData = {
                        peer: req.query.peer,
                        fcn: "GetDealPublishByMonthDealYear",
                        args: '[\"' + month + '\",\"' + toLowerCase(req.query.dealId) + '\",\"' + year + '\"]'


                    };
                    logger.debug("---" + JSON.stringify(getData));
                    request.get({
                        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortDealPublishAuditTrialCC + '?' + require('querystring').stringify(getData),
                        headers: {
                            'content-type': 'application/json',
                            'authorization': 'Bearer ' + req.query.token
                        }
                        // body:require('querystring').stringify(getData)
                    },
                        function (error, response, body) {
                            //logger.debug("insoide function error nooooo:\n============="+body);
                            if (!error && response.statusCode == 200) {
                                logger.debug(body);
                                if (body.length > 2) {
                                    response = JSON.parse(body);
                                    DealPublishCCEmitter.data = response;
                                    DealPublishCCEmitter.emit('updateDealPublishCC');
                                }
                                else {
                                    res.sendStatus(204);
                                }

                                // res.send(response);
                            } else {
                                logger.debug(response.statusCode + response.body);
                                res.send({ token: -1 });
                            }
                        });

                    //if the status for the dealid and month = 1,then the investor can view the report
                    DealPublishCCEmitter.on('updateDealPublishCC', function () {
                        logger.debug("Emitter Response:::" + JSON.stringify(DealPublishCCEmitter.data));


                        // if (DealPublishCCEmitter.data[0].Status == "1") {
                        //   logger.debug("inside if!!");
                        logger.debug("ID-----" + DealPublishCCEmitter.data[0].User);

                        if (contains(DealPublishCCEmitter.data[0].User, userid)) {
                            var getData = {
                                peer: req.query.peer,
                                fcn: "GetHistoryOfInvestorReport",
                                args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'


                            };
                            logger.debug("---" + JSON.stringify(getData));
                            request.get({
                                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getData),
                                headers: {
                                    'content-type': 'application/json',
                                    'authorization': 'Bearer ' + req.query.token
                                }
                                // body:require('querystring').stringify(getData)
                            },
                                function (error, response, body) {

                                    if (!error && response.statusCode == 200) {
                                        logger.debug("body::::::" + body + "        body len:  " + body.length);
                                        if (body.length > 2) {
                                            response = JSON.parse(body);
                                            logger.debug("response  len: " + response.length);
                                            if (DealPublishCCEmitter.data[0].Status == "1") {

                                                logger.debug("----------------- status 1 inside if")

                                                var finalres = [];


                                                var arr1 = response[0];
                                                var arr2 = response[1];
                                                var arr3 = response[2];
                                                var arr4 = response[3];

                                                //console.log("arr2:::"+JSON.stringify(arr2));


                                                var arr1 = response[0];
                                                var arr2 = response[1];
                                                var arr3 = response[2];
                                                var arr4 = response[3];

                                                //define arrays
                                                for (var i = 0; i < response.length; ++i) {
                                                    var irData = response[i][0].irData;
                                                    var indexBegin = irData.indexOf("{");
                                                    var indexEnd = irData.lastIndexOf("}");
                                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                                    var tempStr = temp.replace(/'/g, "\"");
                                                    var priorinvestorreport = {};
                                                    priorinvestorreport = JSON.parse(tempStr);
                                                    //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                                    if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                                        arr2 = response[i];
                                                    } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                                        arr3 = response[i];
                                                    } else if (priorinvestorreport.hasOwnProperty("DealContactInformation")) {
                                                        arr1 = response[i];
                                                    } else if (priorinvestorreport.hasOwnProperty("PriorityOfPayments")) {
                                                        arr4 = response[i];
                                                    }

                                                }


                                                for (var j = 0; j < arr1.length; ++j) {

                                                    var finaljson = {};
                                                    var finalir = {};

                                                    //1st arr
                                                    var arrt1 = [];
                                                    var arrt2 = [];

                                                    console.log("irid:::" + JSON.stringify(arr1[j].irId));
                                                    var irData = arr1[j].irData;
                                                    var indexBegin = irData.indexOf("{");
                                                    var indexEnd = irData.lastIndexOf("}");
                                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                                    var tempStr = temp.replace(/'/g, "\"");
                                                    var priorinvestorreport = {};
                                                    priorinvestorreport = JSON.parse(tempStr);
                                                    //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                                    for (var key in priorinvestorreport) {
                                                        var temp = JSON.stringify(priorinvestorreport[key]);
                                                        //replaceAll(temp,"Moodys","Moody's");

                                                        temp = temp.replace(/Moodys/g, "Moody's");

                                                        temp = temp.replace(/S&Ps/g, "S&P's");

                                                        temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                                        temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                                        temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                                        finaljson[key] = JSON.parse(temp);
                                                    }

                                                    //4th arr
                                                    var arrt1 = [];
                                                    var arrt2 = [];

                                                    console.log("irid:::" + JSON.stringify(arr4[j].irId));
                                                    var irData = arr4[j].irData;
                                                    var indexBegin = irData.indexOf("{");
                                                    var indexEnd = irData.lastIndexOf("}");
                                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                                    var tempStr = temp.replace(/'/g, "\"");
                                                    var priorinvestorreport = {};
                                                    priorinvestorreport = JSON.parse(tempStr);
                                                    //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                                    for (var key in priorinvestorreport) {
                                                        var temp = JSON.stringify(priorinvestorreport[key]);
                                                        //replaceAll(temp,"Moodys","Moody's");

                                                        temp = temp.replace(/Moodys/g, "Moody's");

                                                        temp = temp.replace(/S&Ps/g, "S&P's");

                                                        temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                                        temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                                        temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                                        finaljson[key] = JSON.parse(temp);
                                                    }

                                                    //2nd and 3rd arr
                                                    var arrt1 = [];
                                                    var arrt2 = [];

                                                    console.log("irid:::" + JSON.stringify(arr2[j].irId));
                                                    var irData = arr2[j].irData;
                                                    var indexBegin = irData.indexOf("{");
                                                    var indexEnd = irData.lastIndexOf("}");
                                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                                    var tempStr = temp.replace(/'/g, "\"");
                                                    var priorinvestorreport = {};
                                                    priorinvestorreport = JSON.parse(tempStr);

                                                    arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];

                                                    console.log("irid:::" + JSON.stringify(arr3[j].irId));
                                                    var irData = arr3[j].irData;
                                                    var indexBegin = irData.indexOf("{");
                                                    var indexEnd = irData.lastIndexOf("}");
                                                    var temp = irData.substring(indexBegin, indexEnd + 1);
                                                    var tempStr = temp.replace(/'/g, "\"");
                                                    var priorinvestorreport = {};
                                                    priorinvestorreport = JSON.parse(tempStr);

                                                    arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1'];

                                                    var farr = [];

                                                    arrt1 = arrt1.concat(arrt2);

                                                    for (var key in arrt1) {
                                                        var temptest = JSON.stringify(arrt1[key]);

                                                        temptest = temptest.replace(/Moodys/g, "Moody's");

                                                        temptest = temptest.replace(/S and P/g, "S&P");

                                                        farr[key] = JSON.parse(temptest);
                                                    }

                                                    var farr1 = [];
                                                    
                                                        farr1 = farr;
                                                    finaljson['PortfolioRequirementsTestsSummary'] = farr1;


                                                    if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                                                        delete finaljson['Payments'];
                                                        delete finaljson['Factors'];
                                                        delete finaljson['PriorityOfPayments'];
                                                    }
                                                    if (parseInt(req.query.month) == 9 && parseInt(req.query.year) == 2022) {
                                                        var testSummaryJson = [{
                                                            "Test": "",
                                                            "Result": "",
                                                            "Current": "",
                                                            "Numerator": "",
                                                            "Denominator": "",
                                                            "Minimum": "",
                                                            "Maximum": ""
                                                          }]
                
                                                          finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;
                                                        delete finaljson['Payments'];
                                                        delete finaljson['Factors'];
                                                        delete finaljson['PriorityOfPayments'];
                                                    }
                                                    if (parseInt(req.query.month) == 10 && parseInt(req.query.year) == 2022) {
                                                        var testSummaryJson = [{
                                                            "Test": "",
                                                            "Result": "",
                                                            "Current": "",
                                                            "Numerator": "",
                                                            "Denominator": "",
                                                            "Minimum": "",
                                                            "Maximum": ""
                                                          }]
                
                                                          finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;
                                                      
                                                    }
                                                    finalir['irId'] = arr1[j].irId;
                                                    finalir['irData'] = finaljson;
                                                    finalir['irHash'] = arr1[j].irHash;
                                                    finalir['irMonth'] = arr1[j].irMonth;
                                                    finalir['irYear'] = arr1[j].irYear;
                                                    finalir['irUpdatedBy'] = arr1[j].irUpdatedBy;
                                                    finalir['irUpdationDate'] = arr1[j].irUpdationDate;
                                                    finalir['irDealId'] = arr1[j].irDealId;
                                                    finalir['irVersion'] = arr1[j].irVersion;

                                                    finalres.push(finalir);

                                                }

                                                console.log("final:::" + JSON.stringify(finalres));

                                                var priorinvestorreport = finalres[finalres.length - 1];

                                                console.log("prior:::::" + JSON.stringify(priorinvestorreport));

                                                setTimeout(function () {
                                                    customreportquery(priorinvestorreport['irData']);
                                                }, 300)

                                            }
                                            else {
                                                if (response[0].length > 1) {
                                                    logger.debug("----------------- status 0 inside else")
                                                    var indexversion = DealPublishCCEmitter.data[0].Version;
                                                    // var ind = indexversion.split(" ");
                                                    // var a = parseInt(ind[1]) - 2;
                                                    // var irData = response[a].irData;
                                                    // var irData1 = response[a].irData1;
                                                    // var indexBegin = irData.indexOf("{");
                                                    // var indexEnd = irData.lastIndexOf("}");
                                                    // var temp = irData.substring(indexBegin, indexEnd + 1);
                                                    // var tempStr = temp.replace(/'/g, "\"");
                                                    // var priorinvestorreport = JSON.parse(tempStr);


                                                    var finalres = [];


                                                    var arr1 = response[0];
                                                    var arr2 = response[1];
                                                    var arr3 = response[2];
                                                    var arr4 = response[3];

                                                    //console.log("arr2:::"+JSON.stringify(arr2));

                                                    var arr1 = response[0];
                                                    var arr2 = response[1];
                                                    var arr3 = response[2];
                                                    var arr4 = response[3];

                                                    //define arrays
                                                    for (var i = 0; i < response.length; ++i) {
                                                        var irData = response[i][0].irData;
                                                        var indexBegin = irData.indexOf("{");
                                                        var indexEnd = irData.lastIndexOf("}");
                                                        var temp = irData.substring(indexBegin, indexEnd + 1);
                                                        var tempStr = temp.replace(/'/g, "\"");
                                                        var priorinvestorreport = {};
                                                        priorinvestorreport = JSON.parse(tempStr);
                                                        //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                                                        if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                                                            arr2 = response[i];
                                                        } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                                                            arr3 = response[i];
                                                        } else if (priorinvestorreport.hasOwnProperty("DealContactInformation")) {
                                                            arr1 = response[i];
                                                        } else if (priorinvestorreport.hasOwnProperty("PriorityOfPayments")) {
                                                            arr4 = response[i];
                                                        }

                                                    }


                                                    for (var j = 0; j < arr1.length; ++j) {

                                                        var finaljson = {};
                                                        var finalir = {};

                                                        //1st arr
                                                        var arrt1 = [];
                                                        var arrt2 = [];

                                                        console.log("irid:::" + JSON.stringify(arr1[j].irId));
                                                        var irData = arr1[j].irData;
                                                        var indexBegin = irData.indexOf("{");
                                                        var indexEnd = irData.lastIndexOf("}");
                                                        var temp = irData.substring(indexBegin, indexEnd + 1);
                                                        var tempStr = temp.replace(/'/g, "\"");
                                                        var priorinvestorreport = {};
                                                        priorinvestorreport = JSON.parse(tempStr);
                                                        //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                                        for (var key in priorinvestorreport) {
                                                            var temp = JSON.stringify(priorinvestorreport[key]);
                                                            //replaceAll(temp,"Moodys","Moody's");

                                                            temp = temp.replace(/Moodys/g, "Moody's");

                                                            temp = temp.replace(/S&Ps/g, "S&P's");

                                                            temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                                            temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                                            temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                                            finaljson[key] = JSON.parse(temp);
                                                        }

                                                        //4th arr
                                                        var arrt1 = [];
                                                        var arrt2 = [];

                                                        console.log("irid:::" + JSON.stringify(arr4[j].irId));
                                                        var irData = arr4[j].irData;
                                                        var indexBegin = irData.indexOf("{");
                                                        var indexEnd = irData.lastIndexOf("}");
                                                        var temp = irData.substring(indexBegin, indexEnd + 1);
                                                        var tempStr = temp.replace(/'/g, "\"");
                                                        var priorinvestorreport = {};
                                                        priorinvestorreport = JSON.parse(tempStr);
                                                        //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);


                                                        for (var key in priorinvestorreport) {
                                                            var temp = JSON.stringify(priorinvestorreport[key]);
                                                            //replaceAll(temp,"Moodys","Moody's");

                                                            temp = temp.replace(/Moodys/g, "Moody's");

                                                            temp = temp.replace(/S&Ps/g, "S&P's");

                                                            temp = temp.replace(/MoodyRating/g, "Moody's Rating");
                                                            temp = temp.replace(/SPRating/g, "Standard & Poor's Rating");
                                                            temp = temp.replace(/Fitchs Rating/g, "Fitch's Rating");

                                                            finaljson[key] = JSON.parse(temp);
                                                        }

                                                        //2nd and 3rd arr
                                                        var arrt1 = [];
                                                        var arrt2 = [];

                                                        console.log("irid:::" + JSON.stringify(arr2[j].irId));
                                                        var irData = arr2[j].irData;
                                                        var indexBegin = irData.indexOf("{");
                                                        var indexEnd = irData.lastIndexOf("}");
                                                        var temp = irData.substring(indexBegin, indexEnd + 1);
                                                        var tempStr = temp.replace(/'/g, "\"");
                                                        var priorinvestorreport = {};
                                                        priorinvestorreport = JSON.parse(tempStr);

                                                        arrt1 = priorinvestorreport['PortfolioRequirementsTestsSummary'];

                                                        console.log("irid:::" + JSON.stringify(arr3[j].irId));
                                                        var irData = arr3[j].irData;
                                                        var indexBegin = irData.indexOf("{");
                                                        var indexEnd = irData.lastIndexOf("}");
                                                        var temp = irData.substring(indexBegin, indexEnd + 1);
                                                        var tempStr = temp.replace(/'/g, "\"");
                                                        var priorinvestorreport = {};
                                                        priorinvestorreport = JSON.parse(tempStr);

                                                        arrt2 = priorinvestorreport['PortfolioRequirementsTestsSummary1'];

                                                        var farr = [];

                                                        arrt1 = arrt1.concat(arrt2);

                                                        for (var key in arrt1) {
                                                            var temptest = JSON.stringify(arrt1[key]);

                                                            temptest = temptest.replace(/Moodys/g, "Moody's");

                                                            temptest = temptest.replace(/S and P/g, "S&P");

                                                            farr[key] = JSON.parse(temptest);
                                                        }

                                                        var farr1 = [];
                                                
                                                            farr1 = farr;
                                                        finaljson['PortfolioRequirementsTestsSummary'] = farr1;


                                                        if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                                                            delete finaljson['Payments'];
                                                            delete finaljson['Factors'];
                                                            delete finaljson['PriorityOfPayments'];
                                                        }
                                                        if (parseInt(req.query.month) == 9 && parseInt(req.query.year) == 2022) {
                                                            var testSummaryJson = [{
                                                                "Test": "",
                                                                "Result": "",
                                                                "Current": "",
                                                                "Numerator": "",
                                                                "Denominator": "",
                                                                "Minimum": "",
                                                                "Maximum": ""
                                                              }]
                    
                                                              finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                                                            delete finaljson['Payments'];
                                                            delete finaljson['Factors'];
                                                            delete finaljson['PriorityOfPayments'];
                                                        }   
                                                        if (parseInt(req.query.month) == 10 && parseInt(req.query.year) == 2022) {
                                                            var testSummaryJson = [{
                                                                "Test": "",
                                                                "Result": "",
                                                                "Current": "",
                                                                "Numerator": "",
                                                                "Denominator": "",
                                                                "Minimum": "",
                                                                "Maximum": ""
                                                              }]
                    
                                                              finaljson['PortfolioRequirementsTestsSummary'] = testSummaryJson;

                                                        }                                                        
                                                        finalir['irId'] = arr1[j].irId;
                                                        finalir['irData'] = finaljson;
                                                        finalir['irHash'] = arr1[j].irHash;
                                                        finalir['irMonth'] = arr1[j].irMonth;
                                                        finalir['irYear'] = arr1[j].irYear;
                                                        finalir['irUpdatedBy'] = arr1[j].irUpdatedBy;
                                                        finalir['irUpdationDate'] = arr1[j].irUpdationDate;
                                                        finalir['irDealId'] = arr1[j].irDealId;
                                                        finalir['irVersion'] = arr1[j].irVersion;

                                                        finalres.push(finalir);

                                                    }

                                                    console.log("final:::" + JSON.stringify(finalres));

                                                    var tempdata = finalres[finalres.length - 2];

                                                    var priorinvestorreport = tempdata['irData'];


                                                    setTimeout(function () {
                                                        customreportquery(priorinvestorreport['irData']);
                                                    }, 300)

                                                }
                                                // if only one version of the report is present,but the report not published. 
                                                //so length will be 1 in that case below code
                                                else {
                                                    logger.debug("------ sttaus 0 inside nested else----\n" + "    No report found!");
                                                    res.send("0");
                                                }
                                            }
                                        }
                                        else {
                                            res.sendStatus(204);
                                        }
                                    } else {
                                        logger.debug(response.statusCode + response.body);
                                        res.send({ token: -1 });
                                    }
                                });
                        }

                        else {
                            logger.debug("inside first else")
                            //es.sendStatus(204);
                            //logger.debug()
                            res.send({ "status1": 2 });
                        }


                    });// end of emitter


                } // end of main else
            }

            function customreportquery(priorinvre) {

                var getData = {
                    peer: req.query.peer,
                    fcn: "GetCustomReportByDealIdMonthAndYear",
                    args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                };
                logger.debug("getDataaa++++++" + JSON.stringify(getData));
                request.get({
                    uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortCustomReportCC + '?' + require('querystring').stringify(getData),
                    headers: {
                        'content-type': 'application/json',
                        'authorization': 'Bearer ' + req.query.token
                    }

                },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            logger.debug("length--------" + body.length + "     " + body);

                            if (body.length > 2) {

                                response = JSON.parse(body);
                                logger.debug("Length of response:" + response.length);
                                if (response.length > 0) {
                                    response = JSON.parse(response[0].Page);
                                    aligningfunction(priorinvre, response);
                                }
                                else {
                                    logger.debug("inside if else!!!!");
                                    res.sendStatus(204);
                                }
                            }
                            else {
                                logger.debug("inside else!!!!");
                                res.sendStatus(204);
                            }

                        } else {
                            res.send({ token: -1 });
                        }
                    });
            }

            function aligningfunction(priorinvre, customreport) {

                logger.debug("priorinvestorreport:  \n" + JSON.stringify(priorinvre));
                // logger.debug("custom report: " + JSON.stringify(customreport));

                // priorinvestorreport = JSON.parse(priorinvestorreport);

                // Object.keys(priorinvre).forEach(function (key) {
                //     console.log("k::::" + key);
                // });

                Object.keys(customreport).forEach(function (key) {

                    if (customreport[key].class != "static_table") {

                        for (var c = 0; c < customreport[key].items.length; c++) {

                            logger.debug(customreport[key].items[c].content + "---------------");

                            customreport[key].items[c].data = priorinvre[customreport[key].items[c].content];

                        }

                    }
                })

                if (parseInt(req.query.month) == 8 && parseInt(req.query.year) == 2022) {

                    Object.keys(customreport).forEach(function (key) {

                        if (customreport[key].class != "static_table") {

                            for (var c = 0; c < customreport[key].items.length; c++) {

                                logger.debug(customreport[key].items[c].content + "---------------");

                                if (String(customreport[key].items[c].content) == "Payments" || String(customreport[key].items[c].content) == "Factors"
                                    || String(customreport[key].items[c].content) == "PriorityOfPayments") {
                                    console.log("inside if");
                                    //customreport[key].items[c];
                                    customreport[key].items.splice(c, 1);
                                    --c;
                                }

                            }

                        }
                    })

                }
                setTimeout(function () { res.send(customreport); }, 300);
            }
        }

    },


    sendmail: function (req, res, next) {

        if (!req.body.dealId || !req.body.month || !req.body.year || !req.body.send_to || !req.body.peers ||
            !req.body.token || !req.body.subject || !req.body.message || !req.body.report_format) {

            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.mailUserName,
                    pass: process.env.mailPassword
                }
            });

            logger.debug("---------------------");
            logger.debug("Running Email Job");

            let mailOptions = {

                from: process.env.mailUserName,
                to: req.body.send_to,                   //can be more than 1 mail("mailid 1,mailid 2")
                subject: req.body.subject,
                html: req.body.message,
                attachments: [
                    {
                        // name:"Investor-report-Lima-" + req.body.dealId + "-" + req.body.month + "-" + req.body.year + "."+req.body.report_format,
                        path: "./" + "Investor-report-umb-" + req.body.dealId + "-" + req.body.month + "-" + req.body.year + "." + req.body.report_format
                    },
                    {
                        path: "./" + "Loan-Stratification-report-umb-" + req.body.dealId + "-" + req.body.month + "-" + req.body.year + "." + req.body.report_format
                    }
                ]
            };
            logger.debug("mailOptions::" + JSON.stringify(mailOptions));

            // cron.schedule('0 */1 * * * *', () => {
            //logger.debug("Running Cron Job");

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {

                    logger.debug(error + "    Email : " + req.body.send_to);
                } else {
                    logger.debug("Email successfully sent!  " + req.body.send_to);
                }
            })
            // })
        }
    }
};

module.exports = reportstatus;

