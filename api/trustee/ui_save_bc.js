var request = require('request');
//const uuidv4 = require('uuid/v4');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
const uuidv4 = require('uuid/v4');
const EventEmitter = require('events');
const xlsxFile = require('read-excel-file/node');
const fs = require('fs')
const csv = require('csvtojson');
var MongoClient = require('mongodb').MongoClient
var dateFormat = require('dateformat');
var contains = require("string-contains");
var toLowerCase = require('to-lower-case');

var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";
//var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";


var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

var servicerdata = {

  saveblockchainui: function (req, res, next) {
    var eventemit4 = new EventEmitter();

    if (!req.body.peers || !req.body.token || !req.body.dealId ||
      !req.body.month || !req.body.year) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var dealId = toLowerCase(req.body.dealId);
      var month = req.body.month;
      var year = req.body.year;

      var BCarr = [];
      var Tarr = [];
      var r = 0;
      var c = 1;
      var count = 0;

      //query from mongo for the dealid,month,year
      MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        const db = client.db("UMB");
        logger.debug('CONNECTED');

        db.collection('Loan_Tape_CharlesFort').find({ DealID: dealId, Month: month, Year: year }).toArray(function (err, result) {
          logger.debug("Lengthof result" + result.length);
          if (result.length > 0) {

            for (var i = 0; i < result.length; ++i) {
              if (c == 500) {
                console.debug("C is ::" + c);
                c = 1;
                Tarr.push(result[i]);
                BCarr.push(Tarr); // main array
                r++;
                count++;
                Tarr = [];
              }
              else {
                Tarr.push(result[i]); // temp array 
                c++;
                count++;
                console.debug("C is ::" + c);
                if (count == result.length && c < 500) {
                  console.debug("Count is ::" + count);
                  BCarr.push(Tarr);
                }
              }

              if (count == result.length) { //BCarr.length
                console.debug("inside if:::" + BCarr.length);
                for (ck = 0; ck < BCarr.length; ck++) {

                  checkfrombc(BCarr[ck]);

                }
              }
            }

            function checkfrombc(tem) {
              //for fetching irID
              var getIRid = {
                peer: req.body.peers[0],
                fcn: "GetLoanDataTapeByDealIdMonthAndYear",
                args: '[\"' + dealId + '\",\"' + month + '\",\"' + year + '\"]'
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

                    console.log("body:::" + JSON.stringify(body));

                    if (body.length > 4) {
                      loantape = JSON.parse(body);
                      // var result =
                      // {
                      //   "success": false,
                      //   "result": "Data already Saved"
                      // }


                      for (var i = 0; i < loantape.length; ++i) {
                        logger.debug("id::" + loantape[i].DataID);
                        for (var j = 0; j < tem.length; ++j) {
                          if (loantape[i].SeqNo == tem[j].SeqNo) {
                            tem[j].DataId = loantape[i].DataID;
                          }
                        }
                      }

                      setTimeout(function () {
                        saveToBC2(tem);
                      }, 300)

                    }
                    else {
                      saveToBC2(tem);

                    }

                  } else {
                    logger.debug(response.statusCode + response.body);
                    res.send({ AcaciaLoanTapeCC: -1 });
                  }
                });
            }

            var g = 1;
            var s = 0;
            function saveToBC2(tem) {
              console.debug(JSON.stringify(tem) + "::");

              var postData = {
                peers: req.body.peers,
                fcn: "CreateLoanDataTapeArray",
                args: [JSON.stringify(tem)]
              };
              logger.debug(JSON.stringify(postData) + "::::::::::::::::::::::::::::::::::");
              request.post({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortLoanTapeCC,
                headers: {
                  'content-type': 'application/json',
                  'authorization': 'Bearer ' + req.body.token
                },
                body: JSON.stringify(postData)
              },
                function (error, response, body) {
                  // logger.debug("statuscode::" + response.statusCode);
                  if (!error && response.statusCode == 200) {
                    //logger.debug(":::tem::::" + JSON.stringify(tem));
                    response = JSON.parse(body);

                    logger.debug("success msg::" + response.success);
                    if (response.success == true) {
                      logger.debug("success" + s);
                      s++;
                      logger.debug("response::" + JSON.stringify(response));
                      console.log("s:::" + s);
                      console.log("BC:::" + BCarr.length);
                      if (s == BCarr.length) {
                        var result =
                        {
                          "success": true,
                          "result": "Data Saved"
                        }
                        res.send(result);
                      }

                    } else {
                      logger.debug("false" + g);
                      logger.debug("response::" + JSON.stringify(response));
                      g++;
                      logger.debug("|||||||||||||||||||||||||||||||||||||||||");
                      setTimeout(function () {
                        write();

                      }, 500);
                      function write() {
                        saveToBC2(tem);

                      }
                    }

                  } else {
                    logger.debug(response.statusCode + response.body);
                    res.send({ token: -1 });
                  }
                });

            } //end of saveToBC2

          }//end of if
          else {
            var result =
            {
              "success": false,
              "result": "Data not Present"
            }
            res.send(result);
          }


        });
      });

    } // end of else
  },
  getServicerData: function (req, res, next) {

    var eventemit1 = new EventEmitter();
    var eventemit2 = new EventEmitter();
    logger.debug(req.query);


    if (!req.query.peer || !req.query.token || !req.query.dealId || !req.query.month || !req.query.year) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var dealId = toLowerCase(req.query.dealId);
      var month = req.query.month;
      var year = req.query.year;

      //query from bc for the servicerreport for the dealid,month,year
      var getData = {
        peer: req.query.peer,
        fcn: "GetLoanDataTapeByDealIdMonthAndYear",
        args: '[\"' + dealId + '\",\"' + month + '\",\"' + year + '\"]'
      };
      logger.debug("---" + JSON.stringify(getData));
      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortLoanTapeCC + '?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.query.token
        }
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            //logger.debug(body + " " + body.length);

            //logger.debug("res length:" + JSON.stringify(response) + "   " + response.DTOServicerReport.length)

            //arr.push(response.DTOServicerReport);

            if (body.length > 4) {
              response = JSON.parse(body);
              eventemit1.emit('viewdatafrombc', response);
            }
            else {

              res.sendStatus(204);
              // var arr = [];
              // res.send(arr); // sending an empty array []
            }
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });

      eventemit1.on("viewdatafrombc", function (arr) {

        console.log("arr:::" + arr.length);

        var finalarr = [];
        var prinbal = 0.00;
        var interestcol = 0.00;
        var principalcol = 0.00;
        for (var i = 0; i < arr.length; ++i) {
          var obj1 = JSON.stringify(arr[i]);
          var obj2 = JSON.parse(obj1);

          console.log("json*******" + JSON.stringify(obj2));

          var json = arr[i];
          prinbal = parseFloat(parseFloat(prinbal) + parseFloat(obj2['PrincipalBalance']));

        }

        var json = {
          "srKey": "Number of Assets",
          "srValue": arr.length
        }

        finalarr.push(json);

        var json = {
          "srKey": "Principal Balance",
          "srValue": prinbal
        }
        finalarr.push(json);

        if (req.query.month == 6 && req.query.year == 2022) {

          var json = {
            "srKey": "Interest Collected",
            "srValue": "7390.57"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Principal Collected",
            "srValue": "16391.31"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Expense Collected",
            "srValue": "144.61"
          }
          finalarr.push(json);
        } else if (req.query.month == 7 && req.query.year == 2022) {

          var json = {
            "srKey": "Interest Collected",
            "srValue": "8162.22"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Principal Collected",
            "srValue": "16604.26"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Expense Collected",
            "srValue": "0.00"
          }
          finalarr.push(json);
        } else if (req.query.month == 8 && req.query.year == 2022) {

          var json = {
            "srKey": "Interest Collected",
            "srValue": "9052.77777777778"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Principal Collected",
            "srValue": "11279004.8528071"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Expense Collected",
            "srValue": "0.00"
          }
          finalarr.push(json);
        } else if (req.query.month == 9 && req.query.year == 2022) {

          var json = {
            "srKey": "Interest Collected",
            "srValue": "0.00"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Principal Collected",
            "srValue": "0.00"
          }
          finalarr.push(json);

          var json = {
            "srKey": "Expense Collected",
            "srValue": "0.00"
          }
          finalarr.push(json);
        }

        var js = {
          "DTOServicerReport": finalarr
        }

        res.send(js);
        //}
      })

    }//end of first else

  }

}
module.exports = servicerdata;