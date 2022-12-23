var request = require('request');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
var EventEmitter = require("events").EventEmitter;
var toLowerCase = require('to-lower-case');

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";


var investor = {


    // query for the investor role and status = approved from bc
    getallinvestors: function (req, res, next) {

        logger.debug(req.body);

        if (!req.query.peer || !req.query.token) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }

        else {

            var orgname = process.env.charlesfortInvestorOrgName;
            var status = "Approved";
            var arr = [];
            var getData = {
                peer: req.query.peer,
                fcn: "GetUserByOrgAndStatus",
                args: '[\"' + orgname + '\",\"' + status + '\"]'

            };
            logger.debug("---" + JSON.stringify(getData));
            request.get({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC + '?' + require('querystring').stringify(getData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + req.query.token
                }
                // body:require('querystring').stringify(getData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) { 
                        response = JSON.parse(body);
                        logger.debug(JSON.stringify(response));
                        for(var i=0;i< response.length;i++){
                            if(response[i].ApproveStatus == "Approved"){
                                arr.push(response[i]);
                            }
                        }
                        logger.debug("response of getting all inv:::"+JSON.stringify(arr));
                        res.send(arr);
                    }

                    else {
                        logger.debug(response.statusCode + response.body);
                        res.send({ token: -1 });
                    }
                })
        }

    },

    getadjustmentmonth: function(req,res,next){
      var publishemit=new EventEmitter();
      var arr=[];
        var getData = {
            peer: req.query.peer,
            fcn: "GetInitialSetupByDealID",
            args: '[\"' + toLowerCase(req.query.dealId) + '\"]'
          };
          logger.debug("---" + JSON.stringify(getData));
          request.get({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInitialSetupCC + '?' + require('querystring').stringify(getData),
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.query.token
            }
            // body:require('querystring').stringify(getData)
          },
            function (error, response, body) {
      
              if (!error && response.statusCode == 200) {
                logger.debug("--------" + body.length);
      
                if (body.length > 4) {
                  initialSetupDTO = JSON.parse(body);
                  var ClosingDate = initialSetupDTO.closingDate;
                  var obj = new Date(ClosingDate);
                  var month = obj.getMonth();
                  logger.debug("month: "+month +"closing date: "+ClosingDate);
                 // publishemit.emit("hideinvestor",month)
                  res.send({ "isSuccess": true, "adjustment": month});
                }
                else {
                  res.send({ "isSuccess": false, "adjustment": "DealName Not Exist!" });
                }
      
              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });

    }

}
module.exports = investor;
