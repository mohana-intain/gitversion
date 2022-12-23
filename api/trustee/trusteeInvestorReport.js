var request = require('request');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
var EventEmitter = require("events").EventEmitter;
var crypto = require('crypto');
const uuidv4 = require('uuid/v4');
var contains = require("string-contains");
var toLowerCase = require('to-lower-case');

String.prototype.equalsIgnoreCase = function (compareString) {
  return this.toUpperCase() === compareString.toUpperCase();
};


var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";


var invReport = {


  getInvestorReport: function (req, res, next) {
    logger.debug(req.query);

    //check for the args
    if(!req.query.peer || !req.query.token ||  !req.query.role || !req.query.dealId || !req.query.month || !req.query.year || !req.query.version) 
    {
      res.status(400).send({"message":"Missing Arguments!"});
    }

    else{


    var DealPublishCCEmitter = new EventEmitter();

    var Role = req.query.role;

    var month;
    var year;

    if(parseInt(req.query.month) == 1){
      month = "12";
      year = parseInt(req.query.year)-1;
    }
    else{
      month = String(parseInt(req.query.month)-1);
      year = parseInt(req.query.year);
    }
    
    //check for the role
    if (Role.equalsIgnoreCase(process.env.TrusteeOrgName)) {


      //if trsutee,then can view the report even if the status of the report =0
      var getData = {
        peer: req.query.peer,
        fcn: "GetHistoryOfInvestorReport",
        args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year.toString() + '\"]'


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
            logger.debug("body::::::" + body);
            if (body.length > 2) {
              response = JSON.parse(body);
              var v = req.query.version;
              var str = v.split(" ");
              var version = parseInt(str[1]) - 1;
              logger.debug("str in version:::::::::::::::::::\n\n"+version +"     length in inv report: "+response.length);
              var irData = response[version].irData;
              var indexBegin = irData.indexOf("{");
              var indexEnd = irData.lastIndexOf("}");
              var temp = irData.substring(indexBegin, indexEnd + 1);
              var tempStr = temp.replace(/'/g, "\"");
              var resJson = JSON.parse(tempStr);
              logger.debug("irData in version:::::\n\n"+JSON.stringify(resJson))
              res.send(resJson);
            }
            else {
              logger.debug("inside else!!");
              res.sendStatus(204);
            }
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });


    }
    //if the role is not trustee
    else {
     
      if(!req.query.userid){
        res.status(400).send({"message":"Missing Arguments!"});
      }
      else{
        
        var userid = req.query.userid;
      var getData = {
        peer: req.query.peer,
        fcn: "GetDealPublishByMonthDealYear",
        args: '[\"' + month + '\",\"' + toLowerCase(req.query.dealId) + '\",\"' + year.toString() + '\"]'


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
          logger.debug("ID-----"+DealPublishCCEmitter.data[0].User);

        if(contains(DealPublishCCEmitter.data[0].User,userid)){
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
                logger.debug("body::::::" + body);
                if (body.length > 2) {
                  response = JSON.parse(body);
                  if (DealPublishCCEmitter.data[0].Status == "1"){

                    var indexversion = DealPublishCCEmitter.data[0].Version;
                    var ind = indexversion.split(" ");
                    var a = parseInt(ind[1]) - 1;//version 1==1 version [0]
                    var irData = response[a].irData;
                    var indexBegin = irData.indexOf("{");
                    var indexEnd = irData.lastIndexOf("}");
                    var temp = irData.substring(indexBegin, indexEnd + 1);
                    var tempStr = temp.replace(/'/g, "\"");
                    var resJson = JSON.parse(tempStr);
                    res.send(resJson);
                  }
                  else{
                    var indexversion = DealPublishCCEmitter.data[0].Version;
                    var ind = indexversion.split(" ");
                    var a = parseInt(ind[1]) - 2;
                    var irData = response[a].irData;
                    var indexBegin = irData.indexOf("{");
                    var indexEnd = irData.lastIndexOf("}");
                    var temp = irData.substring(indexBegin, indexEnd + 1);
                    var tempStr = temp.replace(/'/g, "\"");
                    var resJson = JSON.parse(tempStr);
                    res.send(resJson);

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

          else{
            logger.debug("inside first else")
            //es.sendStatus(204);
            //logger.debug()
            res.send({"status1":2});
          }

        
      });// end of emitter
    

    } // end of main else
  }
  }//end of first else
  
  }

}
module.exports = invReport;
