var request = require('request');
const fabricURL = process.env.charlesFortfabricURL;
// const fabricURL = 'https://charlesfort-internal.umbprod.intainabs.com';
var EventEmitter = require("events").EventEmitter;
const uuidv4 = require('uuid/v4');
var MongoClient = require('mongodb').MongoClient;
var dateFormat = require('dateformat');
var contains = require('string-contains');
var moment = require('moment');
const days360 = require('days360');
var sha256 = require("sha256");
let nodemailer = require("nodemailer");
var toLowerCase = require('to-lower-case');
var HashMap = require('hashmap');
var url = "mongodb://127.0.0.1:27017/";
// var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";
//var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";
var log4js = require("log4js");
const { parse } = require('path');
const { ratingdetails } = require('./helpers/ratingdetails.js');
const { servicerstrat } = require('./helpers/servicerstrat.js');
var logger = log4js.getLogger();
logger.level = "debug";


var chaincodereport = {

  chaincodereport: function (req, res, next) {
    var investorid = ['a0f9faea-e21c-4d0f-91ad-c4c6f714b94b']
    if (investorid.length == 0) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    // check for the args else missing param as a response
    else if (!req.body.peers || !req.body.token || !req.body.month || !req.body.year || !req.body.dealId || !req.body.userId ||
      !req.body.dates || !req.body.floating || !req.body.additionaldetails || !req.body.isInitialAccrualPeriod
      || !req.body.accounts || !req.body.fees || !req.body.waterfall || !req.body.newlogic || !req.body.version) {

      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var dealId = req.body.dealId;
      var month = req.body.month;
      var year = req.body.year;
      var charlesfort_id;
      var irId1;
      var irId2;
      var irId3;
      var irId4;

      var v = req.body.version;
      var v1 = parseInt(v) + 1;
      var version = "Version " + String(v1);

      //helper class
      var loantapehelper1 = require('./helpers/calculationvalues.js');
      var loantapehelper2 = require('./helpers/portfoliointerest.js');
      var loantapehelper3 = require('./helpers/portfolioprinicpal.js');
      var loantapehelper4 = require('./helpers/portfolioindustrystrat.js');
      var loantapehelper5 = require('./helpers/ratingstrat.js');
      var loantapehelper6 = require('./helpers/ratingdetails.js');
      var loantapehelper7 = require('./helpers/ratingissuance.js');
      var loantapehelper8 = require('./helpers/investmentcreditdetails.js');
      var loantapehelper9 = require('./helpers/servicerstrat.js');
      var loantapehelper10 = require('./helpers/collateralinfo.js');
      var loantapehelper11 = require('./helpers/portfoliocolsales.js');
      //variable declaration


      var enddate = "";
      var startdate = "";
      //cals arr
      var caltablearr = [];
      var interestdetails = [];
      var principaldetails = [];
      var industrystrat = [];
      var ratingstrat = [];
      var ratingdetail = [];
      var ratingissance = [];
      var investmentdetail = [];
      var collateralinfo = [];
      var servicerstratdetail = [];
      var portfoliocolsales = [];

      var accural_days = "";

      //variables
      var beg_fee_shortfall1;
      var beg_fee_shortfall2;
      var beg_fee_shortfall3;
      var beg_fee_shortfall4;
      var beg_fee_shortfall5;
      var beg_fee_shortfall6;
      var beg_fee_shortfall7;
      var beg_fee_shortfall8;
      var beg_fee_shortfall9;
      var beg_fee_shortfall10;
      var beg_fee_shortfall11;
      var beg_fee_shortfall12;

      var cashacc_beg_bal1;
      var cashacc_beg_bal2;
      var cashacc_beg_bal3;
      var cashacc_beg_bal4;
      var cashacc_beg_bal5;
      var cashacc_beg_bal6;
      var cashacc_beg_bal7;
      var cashacc_beg_bal8;
      var cashacc_beg_bal9;
      var cashacc_beg_bal10;
      var cashacc_beg_bal11;
      var cashacc_beg_bal12;

      var summary_begbal1;
      var summary_begbal2;
      var summary_begbal3;
      var summary_begbal4;
      var summary_begbal5;
      var summary_begbal6;
      var summary_begbal7;
      var summary_begbal8;

      var beg_int_shortfall1;
      var beg_int_shortfall2;
      var beg_int_shortfall3;
      var beg_int_shortfall4;
      var beg_int_shortfall5;
      var beg_int_shortfall6;
      var beg_int_shortfall7;
      var beg_int_shortfall8;

      //emitter
      // var InitialSetupGetEmit = new EventEmitter();
      var PriorReportEmit = new EventEmitter();
      var chaincodeEmitter = new EventEmitter();
      var FetchLoanTape = new EventEmitter();
      var servicertablecalemit = new EventEmitter();
      var GetTable = new EventEmitter();
      var emit1 = new EventEmitter();
      var InvestorReportCCEmitter = new EventEmitter();
      var finalemitter = new EventEmitter();
      var InvestorReportCCEmitter1 = new EventEmitter();
      var InvestorReportCCEmitter2 = new EventEmitter();
      var InvestorReportCCEmitter3 = new EventEmitter();
      var InvestorReportCCEmitter4 = new EventEmitter();
      var queryforenabledisable = new EventEmitter();
      var enabledisablesave = new EventEmitter();
      var PriorData = new EventEmitter();
      logger.debug("investorid length::" + investorid.length);



      //  if ((req.body.month == 6) && req.body.year == 2022) {
      console.log("inside 1");
      var nextdate = req.body.nextPaymentDate;
      console.log("date:: " + nextdate);
      var obj = new Date(nextdate);
      var month1 = obj.getMonth() + 1;
      var year1 = obj.getFullYear();
      logger.debug("req.body.month:" + req.body.month);
      logger.debug("req.body.year::" + req.body.year);
      logger.debug("month1 :" + month1 + ":::year1::" + year1);
      // }
      // else {

      //   var nextdate = req.body.dates.currentpaymentdate;
      //   var obj = new Date(nextdate);
      //   var month1 = obj.getMonth() + 1;
      //   var year1 = obj.getFullYear();
      //   logger.debug("req.body.month:" + req.body.month);
      //   logger.debug("req.body.year::" + req.body.year);
      //   logger.debug("month1 :" + month1 + ":::year1::" + year1);
      // }

      isInitialAccrualPeriod = req.body.isInitialAccrualPeriod;

      if (req.body.month == 1 && req.body.year == 2022) {
        var month = parseInt(12);
        var year = parseInt(req.body.year) - 1;
      } else {
        var month = parseInt(req.body.month) - 1;
        var year = req.body.year;
      }


      console.log("fabricURL\n");
      console.log(fabricURL);

      //check date
      if (req.body.month == 6 && parseInt(month1) == 6 && (parseInt(year1) == (req.body.year))) {
        logger.debug("next payment date is correct - if");
        startfunction();
      }
      else {
        var diff = month1 - parseInt(req.body.month);
        var diff1 = year1 - parseInt(req.body.year);
        if (parseInt(diff) == 0 && parseInt(diff1) == 0) {
          logger.debug("next payment date is correct - nested if");
          startfunction();
        }
        else {
          logger.debug("next payment date is wrong!");
          res.sendStatus(204);
        }
      }//end of else

      function startfunction() {

        if (isInitialAccrualPeriod == "yes" && month != "6") {

          logger.debug("accrual period is yes and month is incorrect");
          res.sendStatus(208);
        } else {

          logger.debug("inside startfunction else!")
          //servicerfrombc();
          InitialSetupGetEmit();

        }
      }//end of start fn


      // Getting the data from initial setup chaincode
      function InitialSetupGetEmit() {

        logger.debug("inside servicer***!")
        var getIniData = {
          peer: req.body.peers[0],
          fcn: "GetInitialSetupByDealID",
          args: '[\"' + toLowerCase(req.body.dealId) + '\"]'
        };
        logger.debug("--///-" + JSON.stringify(getIniData));
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInitialSetupCC + '?' + require('querystring').stringify(getIniData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
        },
          function (error, response, body) {
            console.log(error);
            if (!error && response.statusCode == 200) {
              if (body.length > 4) {
                response = JSON.parse(body);
                initialSetupDTO = response;
                logger.debug("Initial Setup1 CC data :::" + JSON.stringify(initialSetupDTO));

                var date1 = new Date(String(req.body.startDate));
                var date2 = new Date(String(req.body.endDate));

                // To calculate the time difference of two dates
                var Difference_In_Time = date2.getTime() - date1.getTime();

                // To calculate the no. of days between two dates
                var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

                accural_days = String(Difference_In_Days);
                enddate = String(req.body.endDate);
                startdate = String(req.body.startDate);

                console.log("acuural days::" + accural_days);

                setTimeout(function () {
                  PriorReportEmit.emit('getPriorReport');
                }, 300)
              }

              else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });

              }

            } else {
              logger.debug(response.statusCode + response.body);
              res.send({ AcaciaInitialSetupCC: -1 });
            }

          });
      }//end of AcaciaInitialSetupCC emit

      // it will fetch the data from the chaincode TrancheCC by passing the dealId


      // check for the initial accrual period condition
      PriorReportEmit.on('getPriorReport', function () {

        //initialaccrualperiod == yes

        logger.debug("\nin this case there is no prior investor report is available\n");

        //for fetching irID
        var getIRid = {
          peer: req.body.peers[0],
          fcn: "GetInvestorReportByMonthAndYear",
          args: '[\"' + String(dealId).toLowerCase() + '\",\"' + month + '\",\"' + year + '\"]'
        };
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getIRid),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // body:require('querystring').stringify(getIRid)
        },
          function (error, response, body) {

            // console.log("error: "+error+"   body: "+body+"respose:    "+response)
            if (!error && response.statusCode == 200) {

              if (body.length > 4) {
                previousInvestorReportData = JSON.parse(body);

                console.log("previousInvestorReportData: "+JSON.stringify(previousInvestorReportData)+"   "+month+"    "+year)
                // irId1 = previousInvestorReportData[0].irId;
                // irId2 = previousInvestorReportData[1].irId;
                // irId3 = previousInvestorReportData[2].irId;
                // irId4 = previousInvestorReportData[3].irId;

                for (var i = 0; i < previousInvestorReportData.length; ++i) {
                  var irData = previousInvestorReportData[i].irData;
                  var indexBegin = irData.indexOf("{");
                  var indexEnd = irData.lastIndexOf("}");
                  var temp = irData.substring(indexBegin, indexEnd + 1);
                  var tempStr = temp.replace(/'/g, "\"");
                  var priorinvestorreport = {};
                  priorinvestorreport = JSON.parse(tempStr);
                  //logger.debug("priorinvestorreport::"+i+"::::" + priorinvestorreport);

                  if (priorinvestorreport.hasOwnProperty("DealContactInformation")) {
                    irId1 = previousInvestorReportData[i].irId;
                  } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                    irId2 = previousInvestorReportData[i].irId;
                  } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                    irId3 = previousInvestorReportData[i].irId;
                  } else if (priorinvestorreport.hasOwnProperty("PriorityOfPayments")) {
                    irId4 = previousInvestorReportData[i].irId;
                  }


                  // irId1 = "b5a95038-128f-4c58-8372-d9fcd0863c05"
                  // irId2 = "171f1e9b-60e0-446a-9c25-170083268f3e"
                  // irId3 = "abd4e988-158b-476b-a81f-5e269e4156a5"
                  // irId4 = "370180f5-f96f-441c-bb3f-2561c9ba92a6"
                }

                console.log("irID:::::" + JSON.stringify(irId1));
                console.log("inside 1st if")

                setTimeout(function () {
                  //FetchLoanTape.emit('loantapefrombc');
                  if (String(req.body.isInitialAccrualPeriod).toLowerCase() == "yes") {
                    FetchLoanTape.emit('loantapefrombc');
                  } else {
                    PriorData.emit("getcashaccount");
                    // FetchLoanTape.emit('loantapefrombc');
                  }
                }, 200)

              }
              else {

                irId1 = uuidv4().toString();
                irId2 = uuidv4().toString();
                irId3 = uuidv4().toString();
                irId4 = uuidv4().toString();
                logger.debug(irId1 + "-----irId----when previous data is not available");
                logger.debug(irId2 + "-----irId----when previous data is not available");
                logger.debug(irId3 + "-----irId----when previous data is not available");
                logger.debug(irId4 + "-----irId----when previous data is not available");
                console.log("inside 1st else")
                //FetchLoanTape.emit('loantapefrombc');

                if (String(req.body.isInitialAccrualPeriod).toLowerCase() == "yes") {
                  FetchLoanTape.emit('loantapefrombc');
                } else {
                  PriorData.emit("getcashaccount");
                  // FetchLoanTape.emit('loantapefrombc');
                }

              }

            } else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          });

      });//end of priorreport emit

      PriorData.on("getcashaccount", function () {

        var prevmonth = month - 1;
        //for fetching irID
        var getIRid = {
          peer: req.body.peers[0],
          fcn: "GetInvestorReportByMonthAndYear",
          args: '[\"' + String(dealId).toLowerCase() + '\",\"' + prevmonth + '\",\"' + year + '\"]'
        };
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getIRid),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // body:require('querystring').stringify(getIRid)
        },
          function (error, response, body) {

            if (!error && response.statusCode == 200) {

              response = JSON.parse(body);
              logger.debug("response  len: " + response.length);
              if (body.length > 4) {

                var arr1 = response[0];
                var arr2 = response[1];
                var arr3 = response[2];
                var arr4 = response[3];

                console.log("res 0 :::::" + JSON.stringify(response[0]));

                //define arrays
                for (var i = 0; i < response.length; ++i) {
                  var irData = response[i].irData;
                  var indexBegin = irData.indexOf("{");
                  var indexEnd = irData.lastIndexOf("}");
                  var temp = irData.substring(indexBegin, indexEnd + 1);
                  var tempStr = temp.replace(/'/g, "\"");
                  var priorinvestorreport = {};
                  priorinvestorreport = JSON.parse(tempStr);
                  // logger.debug("priorinvestorreport::"+i+"::::" + JSON.stringify(priorinvestorreport));

                  if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary")) {
                    arr2 = priorinvestorreport;
                  } else if (priorinvestorreport.hasOwnProperty("PortfolioRequirementsTestsSummary1")) {
                    arr3 = priorinvestorreport;
                  } else if (priorinvestorreport.hasOwnProperty("DealContactInformation")) {
                    arr1 = JSON.parse(JSON.stringify(priorinvestorreport));
                  } else if (priorinvestorreport.hasOwnProperty("PriorityOfPayments")) {
                    arr4 = priorinvestorreport;
                  }

                }

                //get data
                console.log("arr1:::" + JSON.stringify(arr1));

                //Fees and Expenses
                var feeexpensesarr = arr1['FeesAndExpenses'];
                console.log(JSON.stringify(feeexpensesarr));
                beg_fee_shortfall1 = feeexpensesarr[0]['Ending Fee Shortfall'];
                beg_fee_shortfall2 = feeexpensesarr[1]['Ending Fee Shortfall'];
                beg_fee_shortfall3 = feeexpensesarr[2]['Ending Fee Shortfall'];
                beg_fee_shortfall4 = feeexpensesarr[3]['Ending Fee Shortfall'];
                beg_fee_shortfall5 = feeexpensesarr[4]['Ending Fee Shortfall'];
                beg_fee_shortfall6 = feeexpensesarr[5]['Ending Fee Shortfall'];
                beg_fee_shortfall7 = feeexpensesarr[6]['Ending Fee Shortfall'];
                beg_fee_shortfall8 = feeexpensesarr[7]['Ending Fee Shortfall'];

                //cash accounts
                var cashacc = arr1['CashAccounts'];
                console.log(JSON.stringify(cashacc));
                cashacc_beg_bal1 = cashacc[0]['Balance Post-Payments'];
                cashacc_beg_bal2 = cashacc[1]['Balance Post-Payments'];
                cashacc_beg_bal3 = cashacc[2]['Balance Post-Payments'];
                cashacc_beg_bal4 = cashacc[3]['Balance Post-Payments'];
                cashacc_beg_bal5 = cashacc[4]['Balance Post-Payments'];
                cashacc_beg_bal6 = cashacc[5]['Balance Post-Payments'];
                cashacc_beg_bal7 = cashacc[6]['Balance Post-Payments'];
                cashacc_beg_bal8 = cashacc[7]['Balance Post-Payments'];
                cashacc_beg_bal9 = cashacc[8]['Balance Post-Payments'];
                cashacc_beg_bal10 = cashacc[9]['Balance Post-Payments'];
                cashacc_beg_bal11 = cashacc[10]['Balance Post-Payments'];
                cashacc_beg_bal12 = cashacc[11]['Balance Post-Payments'];

                //beg  balance
                var payments = arr1['Payments'];
                summary_begbal1 = payments[0]['Ending Balance'];
                summary_begbal2 = String(parseFloat(payments[1]['Ending Balance']) + parseFloat(payments[2]['Ending Balance']));
                summary_begbal3 = String(parseFloat(payments[3]['Ending Balance']) + parseFloat(payments[4]['Ending Balance']));
                summary_begbal4 = String(parseFloat(payments[5]['Ending Balance']) + parseFloat(payments[6]['Ending Balance']));
                summary_begbal5 = payments[7]['Ending Balance'];
                summary_begbal6 = payments[8]['Ending Balance'];
                summary_begbal7 = payments[9]['Ending Balance'];
                summary_begbal8 = payments[10]['Ending Balance'];

                beg_int_shortfall1 = payments[0]['Ending Interest Shortfall'];
                beg_int_shortfall2 = String(parseFloat(payments[1]['Ending Interest Shortfall']) + parseFloat(payments[2]['Ending Interest Shortfall']));
                beg_int_shortfall3 = String(parseFloat(payments[3]['Ending Interest Shortfall']) + parseFloat(payments[4]['Ending Interest Shortfall']));
                beg_int_shortfall4 = String(parseFloat(payments[5]['Ending Interest Shortfall']) + parseFloat(payments[6]['Ending Interest Shortfall']));
                beg_int_shortfall5 = payments[7]['Ending Interest Shortfall'];
                beg_int_shortfall6 = payments[8]['Ending Interest Shortfall'];
                beg_int_shortfall7 = payments[9]['Ending Interest Shortfall'];
                beg_int_shortfall8 = payments[10]['Ending Interest Shortfall'];


                setTimeout(function () {
                  FetchLoanTape.emit('loantapefrombc');
                }, 400)

              }
            }
          });//end of function

      });//get cash accounts

      //add emitter for calculating

      FetchLoanTape.on('loantapefrombc', function () {

        console.log("inside loan tape:::");
        //for fetching irID
        var getIRid = {
          peer: req.body.peers[0],
          fcn: "GetLoanDataTapeByDealIdMonthAndYear",
          args: '[\"' + String(dealId).toLowerCase() + '\",\"' + month + '\",\"' + year + '\"]'
        };
        console.log("req::" + JSON.stringify(getIRid));
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortLoanTapeCC + '?' + require('querystring').stringify(getIRid),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // body:require('querystring').stringify(getIRid)
        },
          function (error, response, body) {

            if (!error && response.statusCode == 200) {

              //  console.log("body:::" + JSON.stringify(body));

              if (body.length > 4) {
                console.log("inside body if");
                loantape = JSON.parse(body);
                // console.log(loantape);
                setTimeout(function () {

                  loantape.sort(function (a, b) {
                    // return a.SeqNo > b.SeqNo;
                    return a.SeqNo - b.SeqNo
                  });


                  console.log(loantape.length);

                  servicertablecalemit.emit('servicertable', loantape);
                }, 500)

                // console.log(JSON.stringify(loantape));

              }
              else {

                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });

              }

            } else {
              logger.debug(response.statusCode + response.body);
              res.send({ AcaciaLoanTapeCC: -1 });
            }
          });

      });

      servicertablecalemit.on('servicertable', function (loantape) {

        caltablearr = loantapehelper1.calculatetable(loantape, req.body.month, req.body.year);
        interestdetails = loantapehelper2.portfoliointerest(loantape, req.body.month, req.body.year);
        principaldetails = loantapehelper3.portfolioprinicpal(loantape, req.body.month, req.body.year);
        industrystrat = loantapehelper4.portfolioindustrystrat(loantape, req.body.month, req.body.year);
        ratingstrat = loantapehelper5.ratingstrat(loantape, req.body.month, req.body.year);
        ratingdetail = loantapehelper6.ratingdetails(loantape, req.body.month, req.body.year);
        ratingissance = loantapehelper7.ratingsissuance(loantape, req.body.month, req.body.year);
        investmentdetail = loantapehelper8.investmentdetails(loantape, req.body.month, req.body.year);
        servicerstratdetail = loantapehelper9.servicerstrat(loantape, req.body.month, req.body.year);
        collateralinfo = loantapehelper10.collateralinfo(loantape, req.body.month, req.body.year);
        portfoliocolsales = loantapehelper11.portfoliocolsales(loantape, req.body.month, req.body.year);

        setTimeout(function () {

          // console.log("calculated arr\n");
          console.log(caltablearr);
          // console.log("\n");
          // servicerstratarr = loantapehelper9.servicerstrat(loantape, req.body.month, caltablearr[17], caltablearr[18], req.body.year);
          chaincodeEmitter.emit('chaincodeEmit', caltablearr);
        }, 3000)

      });//end of servicertable emitter


      chaincodeEmitter.on('chaincodeEmit', function (caltablearr) {
        console.log(JSON.stringify(caltablearr));
        charlesfort_id = uuidv4();

        //summary beg bal
        if (req.body.month == 7 && req.body.year == 2022) {
          summary_begbal1 = "211207289.35";
          summary_begbal2 = "59822124.41";
          summary_begbal3 = "49851770.35";
          summary_begbal4 = "45580822.75";
          summary_begbal5 = "16861843.23";
          summary_begbal6 = "42107444.2";
          summary_begbal7 = "34645131.67";
          summary_begbal8 = "17000000";
        }
        if (req.body.month == 9 && req.body.year == 2022) {
          summary_begbal1 = "211207289.35";
          summary_begbal2 = "59822124.41";
          summary_begbal3 = "49851770.35";
          summary_begbal4 = "46098021.0781353";
          summary_begbal5 = "17170385.1062788";
          summary_begbal6 = "42984374.1370185";
          summary_begbal7 = "35388545.2308602";
          summary_begbal8 = "17000000";
        }
        if (req.body.month == 10 && req.body.year == 2022) {
          summary_begbal1 = "211207289.35";
          summary_begbal2 = "59822124.41";
          summary_begbal3 = "49851770.35";
          summary_begbal4 = "46098021.0781353";
          summary_begbal5 = "17170385.1062788";
          summary_begbal6 = "42984374.1370185";
          summary_begbal7 = "35388545.2308602";
          summary_begbal8 = "17000000";
        }

        //class
        var class1 = "A1";
        var class2 = "A2";
        var class3 = "A2";
        var class4 = "B";
        var class5 = "B";
        var class6 = "C";
        var class7 = "C";
        var class8 = "D1";
        var class9 = "D2";
        var class10 = "E";
        var class11 = "SUBORD";

        //cusip
        var cusip1 = "159846AA2";
        var cusip2 = "159846AB0";
        var cusip3 = "G08964AB7";
        var cusip4 = "159846AC8";
        var cusip5 = "G08964AC5";
        var cusip6 = "159846AD6";
        var cusip7 = "G08964AD3";
        var cusip8 = "159846AE4";
        var cusip9 = "159846AF1";
        var cusip10 = "159846AG9";
        var cusip11 = "159846AA4";

        //original beg bal
        var original_begbal1 = "220000000";
        var original_begbal2 = "0";
        var original_begbal3 = "60000000";
        var original_begbal4 = "0";
        var original_begbal5 = "24000000";
        var original_begbal6 = "16999999.9986712";
        var original_begbal7 = "7000000.00132876";
        var original_begbal8 = "6000000";
        var original_begbal9 = "13000000";
        var original_begbal10 = "10000000";
        var original_begbal11 = "17000000";

        //beg interest shortfall
        if (req.body.month == 7 && req.body.year == 2022) {
          beg_int_shortfall1 = "29676886.25";
          beg_int_shortfall2 = "12809149.12";
          beg_int_shortfall3 = "13037090.25";
          beg_int_shortfall4 = "21651972.95";
          beg_int_shortfall5 = "10879630.8";
          beg_int_shortfall6 = "29145983.93";
          beg_int_shortfall7 = "24674777.6";
          beg_int_shortfall8 = "0.00";
        }
        if (req.body.month == 9 && req.body.year == 2022) {
          beg_int_shortfall1 = "30604489.8512609";
          beg_int_shortfall2 = "13119216.5863295";
          beg_int_shortfall3 = "13350078.0819268";
          beg_int_shortfall4 = "22169171.2781353";
          beg_int_shortfall5 = "11188172.6762788";
          beg_int_shortfall6 = "30022913.8670185";
          beg_int_shortfall7 = "25418191.1608602";
          beg_int_shortfall8 = "0.00";
        }
        if (req.body.month == 10 && req.body.year == 2022) {
          beg_int_shortfall1 = "30604489.8512609";
          beg_int_shortfall2 = "13119216.5863295";
          beg_int_shortfall3 = "13350078.0819268";
          beg_int_shortfall4 = "22169171.2781353";
          beg_int_shortfall5 = "11188172.6762788";
          beg_int_shortfall6 = "30022913.8670185";
          beg_int_shortfall7 = "25418191.1608602";
          beg_int_shortfall8 = "0.00";
        }

        //spred
        var spread1 = "55";
        var spread2 = "70";
        var spread3 = "98";
        var spread4 = "350";
        var spread5 = "625";
        var spread6 = "725";
        var spread7 = "750";
        var spread8 = "N/A";
      
        // var cashacc = arr1['CashAccounts'];
        // console.log("CASH    ++++"+JSON.stringify(cashacc));
        //cash accounts
        if (req.body.month == 7 && req.body.year == 2022) {
          cashacc_beg_bal1 = "0.00";
          cashacc_beg_bal2 = "10578.55";
          cashacc_beg_bal3 = "23505.29";
          cashacc_beg_bal4 = "0.00";
          cashacc_beg_bal5 = "100350.44";
          cashacc_beg_bal6 = "0.00";
          cashacc_beg_bal7 = "0.00";
          cashacc_beg_bal8 = "0.00";
          cashacc_beg_bal9 = "0.00";
          cashacc_beg_bal10 = "0.00";
          cashacc_beg_bal11 = "0.00";
          cashacc_beg_bal12 = "0.00";
        }
        else if (req.body.month == 8 && req.body.year == 2022) {
          cashacc_beg_bal1 = "0.00";
          cashacc_beg_bal2 = "0.00";
          cashacc_beg_bal3 = "0.00";
          cashacc_beg_bal4 = "0.00";
          cashacc_beg_bal5 = "0.00";
          cashacc_beg_bal6 = "0.00";
          cashacc_beg_bal7 = "0.00";
          cashacc_beg_bal8 = "0.00";
          cashacc_beg_bal9 = "0.00";
          cashacc_beg_bal10 = "0.00";
          cashacc_beg_bal11 = "0.00";
          cashacc_beg_bal12 = "0.00";
        }
        else if (req.body.month == 9 && req.body.year == 2022){
          cashacc_beg_bal1 = "0.00";
          cashacc_beg_bal2 = "8162.22";
          cashacc_beg_bal3 = "16604.26";
          cashacc_beg_bal4 = "24950.00";
          cashacc_beg_bal5 = "0.00";
          cashacc_beg_bal6 = "0.00";
          cashacc_beg_bal7 = "0.00";
          cashacc_beg_bal8 = "0.00";
          cashacc_beg_bal9 = "0.00";
          cashacc_beg_bal10 = "0.00";
          cashacc_beg_bal11 = "0.00";
          cashacc_beg_bal12 = "0.00";

                // cashacc_beg_bal1 = cashacc[0]['Payments'];
                // cashacc_beg_bal2 = cashacc[1]['Payments'];
                // cashacc_beg_bal3 = cashacc[2]['Payments'];
                // cashacc_beg_bal4 = cashacc[3]['Payments'];
                // cashacc_beg_bal5 = cashacc[4]['Payments'];
                // cashacc_beg_bal6 = cashacc[5]['Payments'];
                // cashacc_beg_bal7 = cashacc[6]['Payments'];
                // cashacc_beg_bal8 = cashacc[7]['Payments'];
                // cashacc_beg_bal9 = cashacc[8]['Payments'];
                // cashacc_beg_bal10 = cashacc[9]['Payments'];
                // cashacc_beg_bal11 = cashacc[10]['Payments'];
                // cashacc_beg_bal12 = cashacc[11]['Payments'];
        }
        else if (req.body.month == 10 && req.body.year == 2022){
          cashacc_beg_bal1 = "0.00";
          cashacc_beg_bal2 = "17215.00";
          cashacc_beg_bal3 = "11295609.11";
          cashacc_beg_bal4 = "24950.00";
          cashacc_beg_bal5 = "0.00";
          cashacc_beg_bal6 = "0.00";
          cashacc_beg_bal7 = "0.00";
          cashacc_beg_bal8 = "0.00";
          cashacc_beg_bal9 = "0.00";
          cashacc_beg_bal10 = "0.00";
          cashacc_beg_bal11 = "0.00";
          cashacc_beg_bal12 = "0.00";

                // cashacc_beg_bal1 = cashacc[0]['Payments'];
                // cashacc_beg_bal2 = cashacc[1]['Payments'];
                // cashacc_beg_bal3 = cashacc[2]['Payments'];
                // cashacc_beg_bal4 = cashacc[3]['Payments'];
                // cashacc_beg_bal5 = cashacc[4]['Payments'];
                // cashacc_beg_bal6 = cashacc[5]['Payments'];
                // cashacc_beg_bal7 = cashacc[6]['Payments'];
                // cashacc_beg_bal8 = cashacc[7]['Payments'];
                // cashacc_beg_bal9 = cashacc[8]['Payments'];
                // cashacc_beg_bal10 = cashacc[9]['Payments'];
                // cashacc_beg_bal11 = cashacc[10]['Payments'];
                // cashacc_beg_bal12 = cashacc[11]['Payments'];
        }
        //fees and expenses
        if (req.body.month == 7 && req.body.year == 2022) {
          beg_fee_shortfall1 = "0";
          beg_fee_shortfall2 = "0";
          beg_fee_shortfall3 = "3030.61";
          beg_fee_shortfall4 = "1059230.31";
          beg_fee_shortfall5 = "6426.51";
          beg_fee_shortfall6 = "3600";
          beg_fee_shortfall7 = "0";
          beg_fee_shortfall8 = "3087.17";
        }
        else if (req.body.month == 9 && req.body.year == 2022) {
          beg_fee_shortfall1 = "0.00";
          beg_fee_shortfall2 = "0.00";
          beg_fee_shortfall3 = "0.00";
          beg_fee_shortfall4 = "1063264.41";
          beg_fee_shortfall5 = "0.00";
          beg_fee_shortfall6 = "0.00";
          beg_fee_shortfall7 = "0.00";
          beg_fee_shortfall8 = "0.00";
        }
        else if (req.body.month == 10 && req.body.year == 2022) {
          beg_fee_shortfall1 = "0.00";
          beg_fee_shortfall2 = "0.00";
          beg_fee_shortfall3 = "0.00";
          beg_fee_shortfall4 = "1063264.41";
          beg_fee_shortfall5 = "0.00";
          beg_fee_shortfall6 = "0.00";
          beg_fee_shortfall7 = "0.00";
          beg_fee_shortfall8 = "0.00";
          beg_fee_shortfall9 = "0.00";
          beg_fee_shortfall10 = "0.00";
          beg_fee_shortfall11 = "0.00";
          beg_fee_shortfall12 = "0.00";

          caltablearr[0] = 0.00;
          caltablearr[1] = 0.00;
          caltablearr[2] = 0.00;
          caltablearr[3] = 0.00;
          caltablearr[4] = 0.00;
          caltablearr[5] = 0.00;
          caltablearr[6] = 0.00;
          caltablearr[7] = 0.00;
          caltablearr[8] = 0.00;
          caltablearr[9] = 0.00;
          caltablearr[10] = 0.00;
          caltablearr[11] = 0.00;
          caltablearr[12] = 0.00;
          caltablearr[13] = 0.00;

        }



        var postData = {
          peers: req.body.peers,
          fcn: "Generatetable",

          args: [charlesfort_id, String(req.body.dealId), String(month), String(year), summary_begbal1,
            summary_begbal2, summary_begbal3, summary_begbal4, summary_begbal5, summary_begbal6, summary_begbal7,
            summary_begbal8, class1, class2, class3, class4, class5, class6, class7, class8, class9, class10, class11, cusip1,
            cusip2, cusip3, cusip4, cusip5, cusip6, cusip7, cusip8, cusip9, cusip10, cusip11, original_begbal1, original_begbal2, original_begbal3,
            original_begbal4, original_begbal5, original_begbal6, original_begbal7, original_begbal8, original_begbal9,
            original_begbal10, original_begbal11, beg_int_shortfall1, beg_int_shortfall2, beg_int_shortfall3, beg_int_shortfall4, beg_int_shortfall5,
            beg_int_shortfall6, beg_int_shortfall7, beg_int_shortfall8, spread1, spread2, spread3, spread4, spread5, spread6, spread7, spread8,
            String(req.body.floating.rate), accural_days, cashacc_beg_bal1, cashacc_beg_bal2, cashacc_beg_bal3, cashacc_beg_bal4,
            cashacc_beg_bal5, cashacc_beg_bal6, cashacc_beg_bal7, cashacc_beg_bal8, cashacc_beg_bal9, cashacc_beg_bal10, cashacc_beg_bal11, cashacc_beg_bal12,
            beg_fee_shortfall1, beg_fee_shortfall2, beg_fee_shortfall3, beg_fee_shortfall4, beg_fee_shortfall5, beg_fee_shortfall6, beg_fee_shortfall7, beg_fee_shortfall8, 
            String(req.body.fees.trusteefee), String(req.body.fees.sharepayingagentfee), String(req.body.fees.seniorcollateralmanagementfee),
            String(req.body.fees.subordinatecollateralmanagerfee), String(req.body.fees.deloitte),
            String(req.body.fees.puglisi), String(req.body.fees.freshfields), String(req.body.fees.euronext), 
            String(req.body.accounts.interestcollected), String(req.body.accounts.pricipalcollected), String(req.body.accounts.expensecollected),
            String(caltablearr[0]), String(caltablearr[1]), String(caltablearr[2]), String(caltablearr[3]), String(caltablearr[4]), String(caltablearr[5]),
            String(caltablearr[6]), String(caltablearr[7]), String(caltablearr[8]), String(caltablearr[9]), String(caltablearr[10]),
            String(caltablearr[11]), String(caltablearr[12]), String(caltablearr[13]), String(caltablearr[14]),
            String(caltablearr[15]), String(caltablearr[16]), String(caltablearr[17]), String(caltablearr[18]), String(caltablearr[19]),
            String(caltablearr[20]), String(caltablearr[21]), String(caltablearr[22]), String(caltablearr[23]), String(caltablearr[24]),
            String(caltablearr[25]), String(caltablearr[26]), String(caltablearr[27]), String(caltablearr[28]), String(caltablearr[29]),
            String(caltablearr[30]), String(caltablearr[31]), String(req.body.accounts.paymentscollected),beg_fee_shortfall9, beg_fee_shortfall10, beg_fee_shortfall11, beg_fee_shortfall12,String(req.body.fees.trusteeexpenses), String(req.body.fees.intertrust), String(req.body.fees.ratingagenciesmoodys), String(req.body.fees.dlapiper)]
        };
        logger.debug("post data ::: CharlesFortUMB CC" + JSON.stringify(postData));
        request.post({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortCC,
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          },
          body: JSON.stringify(postData)
        },

          function (error, response, body) {
            if (!error && response.statusCode == 200) {

              logger.debug("----------------------------");
              logger.debug("tempres:::" + JSON.stringify(response));
              var response = JSON.parse(body);
              if (response.success == true) {
                logger.debug("tempres:::" + JSON.stringify(response));

                setTimeout(() => {
                  GetTable.emit("gettablecc", charlesfort_id);
                }, 4000);
              }
              else {
                logger.debug("++++++++++++++++++++++++++++++++++++++++++++++");
                res.send({ "isSuccess": false, "message": "Data  Not Saved Successfully" });
              }

            }

            else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          })

      });//end of chaincodeEmitter

      GetTable.on("gettablecc", function (charlesfort_id) {

        console.debug(":::::::::::::::::::::::querying AcaciaCC chaincode:::::::::::::::::::::::::::::::::::::")

        var getData = {
          peer: req.body.peers[0],
          fcn: "GetTable",
          args: '[\"' + charlesfort_id + '\"]'

        };
        logger.debug("---" + JSON.stringify(getData));
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortCC + '?' + require('querystring').stringify(getData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {

            logger.debug("body:: " + body)
            if (!error && response.statusCode == 200) {
              //logger.debug("SaludaCC:\n\n" + body + "                     " + body.length);
              if (body.length > 0) {
                var response = JSON.parse(body);
                var b = response.CalculatedData;
                logger.debug("b::::::" + JSON.stringify(b));
                var res1 = JSON.parse(b);
                logger.debug("res1::::::::::::::::" + res1);
                var chaincoderesponse = JSON.parse(res1);
                logger.debug("response----   " + JSON.stringify(chaincoderesponse));

                sendmail(chaincoderesponse);
              }
              else {
                res.sendStatus(204);
              }

            }
            else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          })

      });//end of get table

      function sendmail(chaincoderesponse) {

        var getData = {
          peer: req.body.peers[0],
          fcn: "GetDealPublishByMonthDealYear",
          args: '[\"' + month + '\",\"' + toLowerCase(req.body.dealId) + '\",\"' + year + '\"]' //passing "dealId" as parameter in the API Call
          //token: req.query.token
        };
        logger.debug("getDataaa++++++" + JSON.stringify(getData));
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortDealPublishAuditTrialCC + '?' + require('querystring').stringify(getData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }

        },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              logger.debug("length--------" + body.length);
              response = JSON.parse(body);
              logger.debug("response from deal publish audit:::::::::::\n\n " + JSON.stringify(response))
              // var v = req.body.version;
              // var str = v.split(" ");
              // var version = parseInt(str[1]) - 1;
              // logger.debug("str in version:::::::::::::::::::\n\n"+version);
              if (response.length > 4) {
                if (response[0].Status == "1") {

                  finalemitter.emit("investorreport", chaincoderesponse);
                }
              }
              else {
                emit1.emit("getuser", investorid.toString(), chaincoderesponse);
              }

            }
            else {
              res.send({ token: -1 });
            }

          })
      } // end of send mail fn

      emit1.on("getuser", function (user, chaincoderesponse) {

        var inv = "";
        str = user.split(",");
        for (var i = 0; i < str.length; i++) {
          inv = str[i];
          InvestorReportCCEmitter.emit("getinv", inv);
        }
        finalemitter.emit("investorreport", chaincoderesponse);

      });//end of emit1

      InvestorReportCCEmitter.on("getinv", function (inv) {

        var getData = {
          peer: req.body.peers[0],
          fcn: "GetUser",
          args: '[\"' + inv + '\"]'
        };
        logger.debug("---" + JSON.stringify(getData));
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC + '?' + require('querystring').stringify(getData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {

            if (!error && response.statusCode == 200) {

              logger.debug(body);
              response = JSON.parse(body);

              var emailid = response.EmailID;

              // sending the mail to the investors assigned with dealtype=Saluda
              logger.debug("EMAIL ID::::::::::::" + emailid);

              //var tempemailid = "monisha.subramanian@intainft.com";
              var mailString = "Hi," + "<br/>   The report has been published and you may have a look at it for the dealid = " + req.body.dealId + ", month = " + req.body.month + ", year = " + req.body.year + ".<br/>Regards,<br/>UMB Trustee!"
              let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.mailUserName,
                  pass: process.env.mailPassword
                }
              });
              // logger.debug("Value----"+JSON.stringify(obj.EmailID[i].EmailID));

              logger.debug("---------------------");
              logger.debug("Running Email Job");
              let mailOptions = {

                from: process.env.mailUserName,
                to: emailid,
                subject: `Report Published`,
                html: mailString
              };
              logger.debug("mailOptions::" + JSON.stringify(mailOptions));

              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  //throw error;
                  logger.debug(error + "Email : " + emailid);
                } else {
                  logger.debug("Email successfully sent!  " + response.EmailID);
                }
              })
            }

            else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          });
      });//end of InvestorReportEmit

      finalemitter.on("investorreport", function (chaincoderesponse) {

        console.log("inside emitt************");

        var json1 = {
          'dealid': String(req.body.dealId),
          'reportingdate': String(req.body.dates.reportingdate),
          'reporttype': "Monthly Trustee Report",
          'relationshipmanager': req.body.additionaldetails.relationshipmanager,
          'address': req.body.additionaldetails.address,
          'email': req.body.additionaldetails.email,
          'collateralmanager': req.body.additionaldetails.collateralmanager,
          'priortrustee': req.body.additionaldetails.priortrustee,
          'successortrustee': req.body.additionaldetails.successortrustee,
          'addtionalfirst': req.body.additionaldetails.addtionalfirst,
          'additionallast': req.body.additionaldetails.additionallast
        }


        var Datetable = [
          [{
            "Reporting Date": String(req.body.dates.reportingdate),
            "Is Payment Date": req.body.dates.ispaymentdate,
            "Current Payment Date": req.body.dates.currentpaymentdate,
            "Accrual Start Date": startdate,
            "Accrual End": enddate,
            "3-month LIBOR Date": req.body.floating.date1,
            "3-month LIBOR Rate": String(req.body.floating.rate) + String("%")
          }],
          [{
            "Next Payment Date": "N/A",
            "Next Accrual Start Date": "N/A",
            "Next Accrual End": "N/A",
            "Next 3-month LIBOR Date": "N/A",
            "Next 3-month LIBOR Rate": "N/A"
          }]]




        console.log("date::::else:::::\n\n");
        console.log(JSON.stringify(Datetable) + "\n\n")

        if (parseInt(req.body.month) == 8 && parseInt(req.body.year) == 2022) {

          //feesandexpenses
          var FeesAndExpensestable = chaincoderesponse.DealFeesAndExpenses;
          for (var i = 0; i < FeesAndExpensestable.length; ++i) {
            var json = FeesAndExpensestable[i];
            delete json['Fee Payments'];
            delete json['Ending Fee Shortfall'];
            FeesAndExpensestable[i] = json;
          }

          //cash accounts
          var CashAccountstable = chaincoderesponse.CASHACCOUNTSETC;
          for (var i = 0; i < CashAccountstable.length; ++i) {
            var json = CashAccountstable[i];
            delete json['Payments'];
            delete json['Balance Post-Payments'];
            CashAccountstable[i] = json;
          }
        } 
        else if (parseInt(req.body.month) == 9 && parseInt(req.body.year) == 2022) {

          //feesandexpenses
          var FeesAndExpensestable = chaincoderesponse.DealFeesAndExpenses;
          for (var i = 0; i < FeesAndExpensestable.length; ++i) {
            var json = FeesAndExpensestable[i];
            delete json['Fee Payments'];
            delete json['Ending Fee Shortfall'];
            FeesAndExpensestable[i] = json;
          }

          //cash accounts
          var CashAccountstable = chaincoderesponse.CASHACCOUNTSETC;
          for (var i = 0; i < CashAccountstable.length; ++i) {
            var json = CashAccountstable[i];
            delete json['Payments'];
            delete json['Balance Post-Payments'];
            CashAccountstable[i] = json;
          }
        }
        else {
          var FeesAndExpensestable = chaincoderesponse.DealFeesAndExpenses;
          var CashAccountstable = chaincoderesponse.CASHACCOUNTSETC;
        }
console.log("RAting---------DEtails   " +ratingdetail);
        if (req.body.month == 7 && req.body.year == 2022) {
          var investorReportOutput1 = {

            "DealContactInformation": json1,
            "Date": Datetable,
            "Summary": chaincoderesponse.Summary,
            "Payments": chaincoderesponse.Payments,
            "Factors": chaincoderesponse.Factors,
            "FeesAndExpenses": chaincoderesponse.DealFeesAndExpenses,
            "AggregatePrincipalBalanceOfAllCollateralizedDebtObligation": chaincoderesponse.AGGREGATEPRINCIPALBALANCEOFALLCOLLATERALIZEDDEBTOBLIGATIONS,
            "CashAccounts": chaincoderesponse.CASHACCOUNTSETC,
            "AccountSummaryReport": chaincoderesponse.AccountSummaryReport,
            "RatingsDetail": ratingdetail,
            "PortfolioInterestDetail": interestdetails,
            "PortfolioPrincipalDetail": principaldetails,
            "RatingsAtIssuance": ratingissance,
            "PortfolioIndustryStratificationTables": industrystrat,
            "RatingStratification": ratingstrat,
            "InvestmentCreditEventDetail": investmentdetail,
            "ServicerStratificationTables": servicerstratdetail
            // "CollateralInformation": collateralinfo
            //  "PortfolioCollateralSalesActivityDetail"
          }
        } else if (req.body.month == 8 && req.body.year == 2022) {
          var investorReportOutput1 = {

            "DealContactInformation": json1,
            "Date": Datetable,
            "Summary": chaincoderesponse.Summary,
            "Payments": chaincoderesponse.Payments,
            "Factors": chaincoderesponse.Factors,
            "FeesAndExpenses": FeesAndExpensestable,
            "AggregatePrincipalBalanceOfAllCollateralizedDebtObligation": chaincoderesponse.AGGREGATEPRINCIPALBALANCEOFALLCOLLATERALIZEDDEBTOBLIGATIONS,
            "CashAccounts": CashAccountstable,
            "AccountSummaryReport": chaincoderesponse.AccountSummaryReport,
            "RatingsDetail": ratingdetail,
            "PortfolioInterestDetail": interestdetails,
            "PortfolioPrincipalDetail": principaldetails,
            "RatingsAtIssuance": ratingissance,
            "PortfolioIndustryStratificationTables": industrystrat,
            "RatingStratification": ratingstrat,
            "InvestmentCreditEventDetail": investmentdetail,
            "CollateralInformation": collateralinfo,
            "ServicerStratificationTables": servicerstratdetail
          }
        } else if(req.body.month == 9 && req.body.year == 2022) {
          var investorReportOutput1 = {
          "DealContactInformation": json1,
          "Date": Datetable,
          "Summary": chaincoderesponse.Summary,
          "Payments": chaincoderesponse.Payments,
          "Factors": chaincoderesponse.Factors,
          "FeesAndExpenses": FeesAndExpensestable,
          "AggregatePrincipalBalanceOfAllCollateralizedDebtObligation": chaincoderesponse.AGGREGATEPRINCIPALBALANCEOFALLCOLLATERALIZEDDEBTOBLIGATIONS,
          "CashAccounts": CashAccountstable,
          "AccountSummaryReport": chaincoderesponse.AccountSummaryReport,
          "RatingsDetail": ratingdetail,
          "PortfolioInterestDetail": interestdetails,
          "PortfolioPrincipalDetail": principaldetails,
          "RatingsAtIssuance": ratingissance,
          "PortfolioIndustryStratificationTables": industrystrat,
          "RatingStratification": ratingstrat,
          "InvestmentCreditEventDetail": investmentdetail,
          "CollateralInformation": collateralinfo,
          "ServicerStratificationTables": servicerstratdetail,
          "PortfolioCollateralSalesActivityDetail": portfoliocolsales

        } }
        else if(req.body.month == 10 && req.body.year == 2022) {
          var investorReportOutput1 = {
          "DealContactInformation": json1,
          "Date": Datetable,
          "Summary": chaincoderesponse.Summary,
          "Payments": chaincoderesponse.Payments,
          "Factors": chaincoderesponse.Factors,
          "FeesAndExpenses": FeesAndExpensestable,
          "AggregatePrincipalBalanceOfAllCollateralizedDebtObligation": chaincoderesponse.AGGREGATEPRINCIPALBALANCEOFALLCOLLATERALIZEDDEBTOBLIGATIONS,
          "CashAccounts": CashAccountstable,
          "AccountSummaryReport": chaincoderesponse.AccountSummaryReport,
          "RatingsDetail": ratingdetail,
          "PortfolioInterestDetail": interestdetails,
          "PortfolioPrincipalDetail": principaldetails,
          "RatingsAtIssuance": ratingissance,
          "PortfolioIndustryStratificationTables": industrystrat,
          "RatingStratification": ratingstrat,
          "InvestmentCreditEventDetail": investmentdetail,
          "CollateralInformation": collateralinfo,
          "ServicerStratificationTables": servicerstratdetail,
          "PortfolioCollateralSalesActivityDetail": portfoliocolsales

        } }




        var investorReportOutput2 = {

          "PortfolioRequirementsTestsSummary": chaincoderesponse.PORTFOLIOREQUIREMENTSTESTSSUMMARY
        }

        var investorReportOutput3 = {

          "PortfolioRequirementsTestsSummary1": chaincoderesponse.PORTFOLIOREQUIREMENTSTESTSSUMMARY1
        }


        var investorReportOutput4 = {

          "PriorityOfPayments": chaincoderesponse.PriorityOfPayments
        }


        console.log("1**" + JSON.stringify(investorReportOutput1));
        console.log("2***" + JSON.stringify(investorReportOutput2));
        console.log("3***" + JSON.stringify(investorReportOutput3));
        console.log("4***" + JSON.stringify(investorReportOutput4));

        // function replaceAll(string, search, replace) {
        //   return string.split(search).join(replace);
        // }

        var invReportStr1 = JSON.stringify(investorReportOutput1);
        var invReportStr2 = JSON.stringify(investorReportOutput2);
        var invReportStr3 = JSON.stringify(investorReportOutput3);
        var invReportStr4 = JSON.stringify(investorReportOutput4);

        // var invReportStr1 = investorReportOutput1;
        // var invReportStr2 = investorReportOutput2;
        // var invReportStr3 = investorReportOutput3;
        // var invReportStr4 = investorReportOutput4;

        //  invReportStr2 = replaceAll(JSON.stringify(invReportStr2),"\'","\\");
        //  invReportStr2 = replaceAll(JSON.stringify(invReportStr2),"\&", "\\&");

        //  replaceAll(JSON.stringify(invReportStr2),"\'","\\");


        // logger.debug("INVESTOR REPORT1:::\n" + invReportStr1);
        // logger.debug("INVESTOR REPORT2:::\n" + invReportStr2);
        // logger.debug("INVESTOR REPORT100:::\n" + invReportStr1);
        invReportStr1 = invReportStr1.replace(/\"/g, "'");
        invReportStr2 = invReportStr2.replace(/\"/g, "'");
        invReportStr3 = invReportStr3.replace(/\"/g, "'");
        invReportStr4 = invReportStr4.replace(/\"/g, "'");

        invReportStr2 = invReportStr2.replace(/\\'/g, "");
        invReportStr3 = invReportStr3.replace(/\\'/g, "");

        logger.debug("Final JSON::::::::invReportStr1::::::::::::::::::::::::::::::::::\n" + invReportStr1);
        logger.debug("Final JSON:::::::::invReportStr2:::::::::::::::::::::::::::::::::\n" + invReportStr2);
        logger.debug("Final JSON:::::::::invReportStr3:::::::::::::::::::::::::::::::::\n" + invReportStr3);
        logger.debug("Final JSON::::::::::invReportStr4::::::::::::::::::::::::::::::::\n" + invReportStr4);
        // logger.debug("-----------------------------------------------------------------------------------");


        // saving data into acaciaDealPublishAuditTrialCC chaincode with  status =0

        logger.debug("invetsor string:" + investorid.toString());



        var postDataDealPublish1CC = {
          peers: req.body.peers,
          fcn: "SaveDealPublish",
          args: [irId1, String(month), toLowerCase(req.body.dealId), "0", investorid.toString(), String(year), version.toString()]
        };
        logger.debug("Post Data DealPublishCC:::::::" + JSON.stringify(postDataDealPublish1CC));
        request.post({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortDealPublishAuditTrialCC,
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          },
          body: JSON.stringify(postDataDealPublish1CC)
        },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              response = JSON.parse(body);

              logger.debug("DEAL:::::::::::::::::::" + JSON.stringify(response));

              InvestorReportCCEmitter1.emit('saveInvestorReport1CC');
              //InvestorReportCCEmitter2.emit('saveInvestorReport2CC');
              //InvestorReportCCEmitter3.emit('saveInvestorReport3CC');
            } else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          });


        var today = new Date();
        var updationDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // emitter to save the data into InvestorReportCC
        InvestorReportCCEmitter1.on('saveInvestorReport1CC', function () {

          logger.debug(irId1 + "-----irId----FROM ELSE CONDITION------------------");
          logger.debug(JSON.stringify(invReportStr1));
          logger.debug("month:" + month)
          var postInvestorReportCC = {
            peers: req.body.peers,
            fcn: "SaveInvestorReport",
            args: [irId1, invReportStr1, String(month), String(year), req.body.userId, updationDate, toLowerCase(req.body.dealId), version.toString()]
          };
          logger.debug("Post Data InvestorReport1CC:::::::" + JSON.stringify(postInvestorReportCC['args']));
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postInvestorReportCC)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                logger.debug("body::" + body);
                response = JSON.parse(body);
                if (response.success == true) {
                  logger.debug("post investor data:::::" + JSON.stringify(response));

                  InvestorReportCCEmitter2.emit('saveInvestorReport2CC');
                }


              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });

        }); // end of emitter InvestorReportCC

        // emitter to save the data into InvestorReportCC
        InvestorReportCCEmitter2.on('saveInvestorReport2CC', function () {

          logger.debug(irId2 + "-----irId----FROM ELSE CONDITION------------------");
          logger.debug(JSON.stringify(invReportStr2));

          // if (req.body.month == 9 && req.body.year == 2022) {
          //   invReportStr2 = "";
          // }
          logger.debug(JSON.stringify(invReportStr2));
          
          logger.debug("month:" + month)
          var postInvestorReportCC = {
            peers: req.body.peers,
            fcn: "SaveTestSummaryInvestorReport",
            args: [irId2, invReportStr2, String(month), String(year), req.body.userId, updationDate, toLowerCase(req.body.dealId), version.toString()]
          };
          logger.debug("Post Data InvestorReport2CC:::::::" + JSON.stringify(postInvestorReportCC['args']));
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postInvestorReportCC)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                logger.debug("body::" + body);
                response = JSON.parse(body);
                if (response.success == true) {
                  logger.debug("post investor data:::::" + JSON.stringify(response));

                  InvestorReportCCEmitter3.emit('saveInvestorReport3CC');
                }


              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });

        }); // end of emitter InvestorReportCC

        // emitter to save the data into InvestorReportCC
        InvestorReportCCEmitter3.on('saveInvestorReport3CC', function () {

          logger.debug(irId3 + "-----irId----FROM ELSE CONDITION------------------");
          
          logger.debug(JSON.stringify(invReportStr3));

          // if (req.body.month == 9 && req.body.year == 2022) {
          //   invReportStr3 = "";
          // }
          logger.debug(JSON.stringify(invReportStr3));
          logger.debug("month:" + month)
          var postInvestorReportCC = {
            peers: req.body.peers,
            fcn: "SaveTestSummaryInvestorReport1",
            args: [irId3, invReportStr3, String(month), String(year), req.body.userId, updationDate, toLowerCase(req.body.dealId), version.toString()]
          };
          logger.debug("Post Data InvestorReport3CC:::::::" + JSON.stringify(postInvestorReportCC['args']));
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postInvestorReportCC)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                logger.debug("body::" + body);
                response = JSON.parse(body);
                if (response.success == true) {
                  logger.debug("post investor data:::::" + JSON.stringify(response));

                  InvestorReportCCEmitter4.emit('saveInvestorReport4CC');
                }


              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });

        }); // end of emitter InvestorReportCC


        // emitter to save the data into InvestorReportCC
        InvestorReportCCEmitter4.on('saveInvestorReport4CC', function () {

          logger.debug(irId4 + "-----irId----FROM ELSE CONDITION------------------");
          logger.debug(JSON.stringify(invReportStr4));
          logger.debug("month:" + month)
          var postInvestorReportCC = {
            peers: req.body.peers,
            fcn: "SavePOPInvestorReport",
            args: [irId4, invReportStr4, String(month), String(year), req.body.userId, updationDate, toLowerCase(req.body.dealId), version.toString()]
          };
          logger.debug("Post Data InvestorReport4CC:::::::" + postInvestorReportCC['args']);
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postInvestorReportCC)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                logger.debug("body::" + body);
                response = JSON.parse(body);
                if (response.success == true) {
                  logger.debug("post investor data:::::" + JSON.stringify(response));

                  queryforenabledisable.emit("queryforenablediable");
                  //res.send({ "isSuccess": true, "message": "Investor Report Generated" });
                }


              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });

        }); // end of emitter InvestorReportCC

        queryforenabledisable.on("queryforenablediable", function () {

          var getData = {
            peer: req.body.peers[0],
            fcn: "GetInputsByDealMonthAndYear",
            args: '[\"' + toLowerCase(req.body.dealId) + '\",\"' + month + '\",\"' + year + '\"]'


          };
          logger.debug("---" + JSON.stringify(getData));
          request.get({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortGenerateInputsCC + '?' + require('querystring').stringify(getData),
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            }
            // body:require('querystring').stringify(getData)
          },
            function (error, response, body) {

              if (!error && response.statusCode == 200) {
                logger.debug("body::::::   " + body + "   " + body.length + "  " + JSON.stringify(response));
                var response = JSON.parse(body);

                if (response.length > 0) {
                  var dummy_id = response[0].GID;
                  enabledisablesave.emit("enabledisablesave", dummy_id);

                }
                else {
                  var dummy_id = uuidv4().toString();
                  enabledisablesave.emit("enabledisablesave", dummy_id);
                }
              }
              else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });

        });//end of queryenable

        enabledisablesave.on("enabledisablesave", function (g_id) {

          var k = 0;
          var savearray = [];

          var json = {
            ["Key " + (k + 1)]: req.body.isInitialAccrualPeriod,
            ["Key " + (k + 2)]: req.body.dates.ispaymentdate,
            ["Key " + (k + 3)]: req.body.dates.reportingdate,
            ["Key " + (k + 4)]: req.body.floating.date1,
            ["Key " + (k + 5)]: req.body.investorid,
            ["Key " + (k + 6)]: req.body.floating.rate,
            ["Key " + (k + 7)]: req.body.accounts,
            ["Key " + (k + 8)]: req.body.fees,
            ["Key " + (k + 9)]: req.body.waterfall.holdbackamt,
            ["Key " + (k + 10)]: req.body.additionaldetails.relationshipmanager,
            ["Key " + (k + 11)]: req.body.additionaldetails.address,
            ["Key " + (k + 12)]: req.body.additionaldetails.email,
            ["Key " + (k + 13)]: req.body.additionaldetails.websitereporting,
            ["Key " + (k + 14)]: req.body.reporttype
          }

          savearray.push(json);

          var savearraystr = JSON.stringify(savearray);

          var postData = {
            peers: req.body.peers,
            fcn: "SaveInputs",
            args: [g_id, toLowerCase(req.body.dealId).toString(), String(month), String(year), savearraystr]
          };

          logger.debug("postData for dummy save inv report:::" + JSON.stringify(postData));

          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortGenerateInputsCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postData)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                logger.debug("body:::" + body + " " + body.length);

                response = JSON.parse(body);

                if (response.success == true) {
                  logger.debug("Data saved in dummy function!");

                  //  investorlist.emit("updateusercc");
                  res.send({ "isSuccess": true, "message": "Investor Report Generated", "charlesfort_id": charlesfort_id });
                }

                else {
                  logger.debug("Data not saved in dummy function!")
                  res.send({ "isSuccess": false, "message": "Data Not Saved Successfully!", "charlesfort_id": charlesfort_id });
                }


              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });

              }
            });
        });//end of enable

      });//end of finalemit


    }//end of else
  }
}// end of module variable

module.exports = chaincodereport;