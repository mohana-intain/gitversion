var request = require('request');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
var EventEmitter = require("events").EventEmitter;
var crypto = require('crypto');
const uuidv4 = require('uuid/v4');
const replaceString = require('replace-string');
const strip = require('strip');
var contains = require("string-contains");
var MongoClient = require('mongodb').MongoClient;
var toLowerCase = require('to-lower-case');

var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";
//var url = "mongodb://root:" + encodeURIComponent("password") + "@35.209.88.39:27017/emulya?authMechanism=SCRAM-SHA-1";

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";


var servicerDataBC = {


  saveServicerDataInBlockchain: function (req, res, next) {

    logger.debug(req.body);

    //check for the args
    if (!req.body.peers || !req.body.token || !req.body.input || !req.body.filetype) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var ServicerReportCCEmitter = new EventEmitter();
      var finalResEmitter = new EventEmitter();

      // var filetype = ".csv";
      var filetype = req.body.filetype;
      logger.debug("filetype:::::::::" + filetype);

      var flag = 0;
      var flag2 = 0;

      var servicerDB_response = {
        "DBres": req.body
      }

      var servicerDB_responseArray = [];

      //check for the filetype
      if (filetype == ".xlsx") {

        for (var i = 0; i < servicerDB_response.DBres.input.length; i++) {


          //preparing json for the key and value for each row
          var jsonData = {
            "SRID": servicerDB_response.DBres.input[i].dataId.toString(),
            "SRKey": servicerDB_response.DBres.input[i].key.toString(),
            "SRValue": servicerDB_response.DBres.input[i].value.toString(),
            "SRValue1": servicerDB_response.DBres.input[i].value1.toString(),
            "SRMonth": servicerDB_response.DBres.input[i].month.toString(),
            "SRYear": servicerDB_response.DBres.input[i].year.toString(),
            "SRUpdatedBy": servicerDB_response.DBres.input[i].updatedBy.toString(),
            "SRUpdationDate": servicerDB_response.DBres.input[i].updationDate.toString(),
            "SRSeqNum": servicerDB_response.DBres.input[i].seqNo.toString(),
            "SRDealID": toLowerCase(servicerDB_response.DBres.input[i].dealId).toString()
          }

          servicerDB_responseArray.push(jsonData);

          flag = flag + 1;
          logger.debug("flag-----------" + flag);

        }
      }
      else {

        logger.debug("inside csv else!!!!!!!");
        for (var i = 0; i < servicerDB_response.DBres.input.length; i++) {

          var value = servicerDB_response.DBres.input[i].value.toString();
          var value2 = servicerDB_response.DBres.input[i].value1.toString();

          // check for special chars, bcz csv file cant perform calculations if special chars are present
          //var value1 = strip('$','%',' ').value;
          var value1 = replaceString(value, '$', '0');
          value1 = replaceString(value1, ',', '');
          var value3 = replaceString(value2, '$', '0');
          value3 = replaceString(value3, ',', '');

          if (contains(value1, "%")) {

            value1 = replaceString(value1, '%', '');
            value1 = value1 / 100;
          }
          if (contains(value3, "%")) {

            value3 = replaceString(value3, '%', '');
            value3 = value3 / 100;
          }


          logger.debug("string replacer:::::" + value1);

          //preparing json to save it to bc
          var jsonData = {
            "SRID": servicerDB_response.DBres.input[i].dataId.toString(),
            "SRKey": servicerDB_response.DBres.input[i].key.toString(),
            "SRValue": value1.toString(),
            "SRValue1": value3.toString(),
            "SRMonth": servicerDB_response.DBres.input[i].month.toString(),
            "SRYear": servicerDB_response.DBres.input[i].year.toString(),
            "SRUpdatedBy": servicerDB_response.DBres.input[i].updatedBy.toString(),
            "SRUpdationDate": servicerDB_response.DBres.input[i].updationDate.toString(),
            "SRSeqNum": servicerDB_response.DBres.input[i].seqNo.toString(),
            "SRDealID": toLowerCase(servicerDB_response.DBres.input[i].dealId).toString()
          }

          servicerDB_responseArray.push(jsonData);

          flag = flag + 1;
          logger.debug("flag-----------" + flag);

        }
      }

      var servicerDB_responseArray_String = JSON.stringify(servicerDB_responseArray);

      logger.debug("servicer::::::::::::::::" + servicerDB_responseArray_String + "-----------------------------");


      // for(var i in servicerDB_response.DBres)
      // {
      //   var jsonData = {};
      //   for(var j in servicerDB_response.DBres[i]){
      //     // logger.debug("-----"+servicerDB_response.DBres[i][j]);
      //     // logger.debug("key:::"+j);
      //     if(j != "id"){

      //        jsonData[j] = servicerDB_response.DBres[i][j];

      //       }
      //     }
      //     servicerDB_responseArray.push(jsonData);
      //   }
      //   logger.debug("input:::"+JSON.stringify(servicerDB_responseArray));


      // save it to bc as a whole json string
      var postData = {
        peers: req.body.peers,
        fcn: "SaveServicerReportAttributeArray",
        args: [servicerDB_responseArray_String]
      };
      logger.debug("postData :::" + JSON.stringify(postData));

      request.post({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + 'ServicerReportCC',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        },
        body: JSON.stringify(postData)
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            logger.debug("body:::" + body + " " + body.length);
            //if (body.length > 358) {
            response = JSON.parse(body);

            if (response.success == true) {
              ServicerReportCCEmitter.data = response;
              ServicerReportCCEmitter.emit('updateServicerReportCCEmitter');
            }
            // }
            else {
              res.send({ "isSuccess": false, "message": "Data Not Saved Successfully!" });
            }

            //res.send(response);
          } else {
            logger.debug(response.statusCode + response.body);
            // res.send({"isSuccess":false,"message":"Data Not Saved Successfully!"});
            res.send({ token: -1 });

          }
        });

      ServicerReportCCEmitter.on('updateServicerReportCCEmitter', function () {

        //update the param (movedto bc = true )in mongo ,after saving it to bc.
        MongoClient.connect(url, function (err, client) {

          for (var i = 0; i < servicerDB_response.DBres.input.length; i++) {
            //logger.debug("dataId---"+servicerDB_response.DBres.input[i].dataId);

            var ID = servicerDB_response.DBres.input[i].dataId;


            //mongo db code
            if (err) throw err
            const db = client.db("UMB");
            logger.debug('CONNECTED');
            // var dataId="47c26238-bf7a-44ea-8bc1-ded5588acfbd"

            db.collection('umb_servicer_data').findOneAndUpdate({ "dataId": ID },
              { $set: { "movedToBlockchain": true } }, function (err, result) {
                logger.debug(result);
                if (err) {
                  res.send({ "isSuccess": false, "message": "Data Not Updated in Mongo DB!" });
                }
                else {
                  //res.send(result)
                  logger.debug("---result---" + JSON.stringify(result));
                  flag2 = flag2 + 1;
                  logger.debug("flag2--------" + flag2);
                  if (flag == flag2) {
                    finalResEmitter.emit('finalRes');
                  }

                }
              })


          }//end of for
        })//end of Mongo Client

      });//end of ServicerReportCCEmitter

      finalResEmitter.on('finalRes', function () {

        logger.debug("inside Final res!");
        logger.debug(flag + "-------flag--------" + flag2);
        logger.debug(servicerDB_response.DBres.input.length + "----------");

        res.send({ "isSuccess": true, "message": "Data Saved Successfully!" });


      });//end of  finalResEmitter

    }//end of first else


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
      //query from bc for the servicerreport for the dealid,month,year
      var getData = {
        peer: req.query.peer,
        fcn: "GetServicerReportAttributeByMonthAndYear",
        args: '[\"' + dealId + '\",\"' + req.query.month + '\",\"' + req.query.year + '\"]'
        // args:'[\"'+req.body.DealId+'\",\"'+req.body.Month+'\",\"'+req.body.Year+'\"]'

      };
      logger.debug("---" + JSON.stringify(getData));
      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + 'ServicerReportCC?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.query.token
        }
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            logger.debug(body);
            response = JSON.parse(body);

            if (response.DTOServicerReport.length > 0) {
              eventemit1.emit("getdatafrommongo", response, dealId, req.query.month, req.query.year);
              //res.send(response);
            }
            else {
              res.send(response); // sending an empty array []
            }
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });

    }//end of first else


    // in bc,data are stored random.To align performing this
    eventemit1.on("getdatafrommongo", function (response, dealId, month, year) {

      logger.debug("response from blockchain:::" + response.DTOServicerReport.length + "  " + JSON.stringify(response));
      var arr = [];
      var seqnum = 1;
      MongoClient.connect(url, function (err, client) {
        const db = client.db("UMB");
        if (err) throw err;

        db.collection('umb_servicer_data').find({ dealId: dealId, month: month, year: year }).toArray(function (err, result) {
          logger.debug("Lengthof result" + result.length);
          if (result.length > 0) {
            logger.debug("getting result of deal that is moved to blockchain " + result[0].movedToBlockchain);
            if (result[0].movedToBlockchain == true) {

              for (var i = 0; i < result.length; i++) {
                if (result[i].seqNo == seqnum) {
                  arr.push(result[i].key);
                  seqnum = seqnum + 1;
                  logger.debug("result from db::::" + arr[i]);
                  i = 0;
                }
              }
              eventemit2.emit("displaycomparedata", response, arr);

            }
          }
        })
      }) // end of mongo
    })   // end of emit

    //using seqnum aligning it and displaying
    eventemit2.on("displaycomparedata", function (response, arr) {

      var result = [];
      logger.debug("inside compare emit");

      for (var i = 0; i < arr.length; i++) {
        var key = arr[i];
        logger.debug("key::::::" + key);

        for (var j = 0; j < response.DTOServicerReport.length; j++) {

          if (response.DTOServicerReport[j].srKey == key) {
            logger.debug("j loop!!!!" + JSON.stringify(response.DTOServicerReport[j]));

            //var value = response.DTOServicerReport[j].srValue.toString();

            //var value1 = replaceString(value,'$','0');
            //value1 = replaceString(value1,'%','');
            //value1 = replaceString(value1,',','');

            //var value1 = replaceString(value,',','');
            //response.DTOServicerReport[j].srValue = value1;
            logger.debug("string replacer:::::" + response.DTOServicerReport[j].srValue);
            logger.debug("string replacer:::::" + response.DTOServicerReport[j].srValue1);
            // if (response.DTOServicerReport[j].srValue != "") {
            //   logger.debug("entered!!!!!!!!!!!!!");
            //   var v1 =  response.DTOServicerReport[j].srValue;
            //   var v2 = Number(v1);
            //   var v3 = v2.toFixed(2);
            //   response.DTOServicerReport[j].srValue = v3;
            //   logger.debug("v3-----------------------"+" "+v3);
            //   result.push(response.DTOServicerReport[j]);
            // }
            // else {
              result.push(response.DTOServicerReport[j]);
            //}
            break;
          }
        }
      }
      logger.debug("result---------------------->  " + JSON.stringify(result));
      var json = { DTOServicerReport: result };
      res.send(json);

    })


  } // end of function


}

module.exports = servicerDataBC;
