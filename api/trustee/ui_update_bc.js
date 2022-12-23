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

    updatereportui: function (req, res, next) {
        var eventemit4 = new EventEmitter();

        var dealId = toLowerCase(req.query.dealId);
        var month = req.query.month;
        var year = req.query.year;

        //check for the args
        if (!req.query.dealId || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {

            //query from mongo for the dealid,month,year
            MongoClient.connect(url, function (err, client) {
                if (err) throw err
                const db = client.db("UMB");
                logger.debug('CONNECTED');
                var movedToBlockchain = 0;
                var message = "Data already moved to blockchain"
                
                db.collection('charlesfort_servicer_data').find({ dealId: dealId, month: month, year: year  }).sort( { seqNo : 1 } ).toArray(function (err, result) {
                        
                    logger.debug("Length of result" + result.length);
                    if (result.length > 0) {
                        logger.debug("move to blockchain" + result[0].movedToBlockchain);
                        if (result[0].movedToBlockchain == false) {

                            //logger.debug("result from db::::" + JSON.stringify(result));
                            eventemit4.emit("datafromdb", result);

                        }
                        // if moved to bc,send the response
                        else if (result[0].movedToBlockchain == true) {
                            movedToBlockchain = 1;
                            logger.debug("result from db::::" + JSON.stringify(result));

                            var data = {
                                success: false,
                                message: message
                            }
                            res.send(data);
                        }
                        // res.send(result);
                    }
                    else {
                        logger.debug("No data found!")
                        res.sendStatus(204);
                    }
                })

            })
        }
        // if not moved to bc(movedtobc = false)
        eventemit4.on("datafromdb", function (result) {
            var seqnum = 1;
            var arr = result;

            logger.debug("arr:"+JSON.stringify(arr))
            

            //need to change
            
            var json = {
                "Interest_Collected": {
                    "value1": arr[0].value
                },
                "Principal_Collected": {
                    "value1": arr[1].value
                },
                "Primary_Management_Fee": {
                    "value1": arr[2].value
                },
                "Secondary_Management_Fee": {
                    "value1": arr[3].value
                }                
            }
  

            logger.debug("ui json:::" +JSON.stringify(json));
        
            res.send(json)
        })
        }
    }

    module.exports  = servicerdata;