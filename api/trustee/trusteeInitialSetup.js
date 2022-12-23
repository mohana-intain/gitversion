var request = require('request');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
// const fabricURL = 'https://charlesfort-internal.umbprod.intainabs.com';
var EventEmitter = require("events").EventEmitter;
var crypto = require('crypto');
const uuidv4 = require('uuid/v4');
var toLowerCase = require('to-lower-case');

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";


var trustee = {

  // to save the onetime inputs entered in initial setup scren
  saveinitialsetup: function (req, res, next) {

    logger.debug(req.body);
    // to check whether all the args are passed from ui
    if (!req.body.peers || !req.body.token || !req.body.dealId || !req.body.userId ||
      !req.body.trancheInput) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var initialSetupEmitter = new EventEmitter();
      var NewWSFSTrancheCCEmitter = new EventEmitter();
      var NewWSFSTrancheCCEmitterSave = new EventEmitter();
      var NoDealID_TrancheCCEmitterSave = new EventEmitter();
      var deallist = new EventEmitter();
      var deallistquery = new EventEmitter();
      logger.debug("tranche--------" + JSON.stringify(req.body.trancheInput));
      // var curDate = new Date();
      // logger.debug("Date:::" + curDate);
      var curDate = new Date();
      var dd = curDate.getDate();
      var mm = curDate.getMonth() + 1;
      var yyyy = curDate.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      curDate = dd + '-' + mm + '-' + yyyy;
      logger.debug(curDate + "---cur_date");

      var initId = "";
      var flag = 0;
      var sum = 0;
      var flag2 = 0;


      // querying initails setup details for a dealid from bc
      var getData = {
        peer: req.body.peers[0],
        fcn: "GetInitialSetupByDealID",
        args: '[\"' + toLowerCase(req.body.dealId) + '\"]'
      };
      logger.debug("---" + JSON.stringify(getData));
      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInitialSetupCC + '?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        }
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            logger.debug("--------" + body);

            if (body.length > 4) {
              response = JSON.parse(body);
              //  initialSetupEmitter.data = JSON.parse(body);
              initId = response.isId;
              logger.debug("initId IF::::" + initId);
              deallist.emit("savedealnames",initId);
             
            }
            else {
              initId = uuidv4();
              logger.debug("initID:" + initId);
              // initialSetupEmitter.data = JSON.parse(body);
              deallist.emit("savedealnames",initId);

            }

            // res.send(response);
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });

        deallistquery.on("querydeallist",function(initId){

          var id = uuidv4();

          var postdeallistcc = {
            peers: req.body.peers,
            fcn: "SaveDealList",
            args: [id.toString(),req.body.dealId]
          };
          logger.debug("Post Data DealListcc:::::::" + JSON.stringify(postdeallistcc));
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesFortDealListCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postdeallistcc)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                logger.debug("body::" + body);
                response = JSON.parse(body);
                if (response.success == true) {
                  logger.debug("postdeallistcc data:::::" + JSON.stringify(response));     
                  initialSetupEmitter.emit('updateInitialSetDetails',initId);             
                }
                else{
                  res.send({ "isSuccess": false, "message": "Data not saved!" });
                }
              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });
        });//



        deallist.on("savedealnames",function(initId){

          var id = uuidv4();

          var postdeallistcc = {
            peers: req.body.peers,
            fcn: "SaveDealList",
            args: [id.toString(),req.body.dealId]
          };
          logger.debug("Post Data DealListcc:::::::" + JSON.stringify(postdeallistcc));
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesFortDealListCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postdeallistcc)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                logger.debug("body::" + body);
                response = JSON.parse(body);
                if (response.success == true) {
                  logger.debug("postdeallistcc data:::::" + JSON.stringify(response));     
                  initialSetupEmitter.emit('updateInitialSetDetails',initId);             
                }
                else{
                  res.send({ "isSuccess": false, "message": "Data not saved!" });
                }
              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });
        })


      // updating the initid and saving it to bc
      initialSetupEmitter.on('updateInitialSetDetails', function (initId) {

        logger.debug("emitterRes initID:::::" + initId);
        var postData = {
          peers: req.body.peers,
          fcn: "SaveInitialSetup",
          args: [initId.toString(), toLowerCase(req.body.dealId),"", "", "", "", req.body.userId]
        };
        logger.debug("Post Data Initial Setup::::::::::" + JSON.stringify(postData));
        request.post({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInitialSetupCC,
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
                NewWSFSTrancheCCEmitter.emit('updateNewWSFSTrancheCCDetails');
              }
              else {
                res.send({ "isSuccess": false, "message": "Data not saved!" });
              }
            } else {
              logger.debug(response.statusCode + response.body);
              //res.send({ "isSuccess": false, "message": "Data not saved!" });
              res.send({ token: -1 });

            }
          });

      });//end of initialSetupEmitter

      var TRID = "";
      var trName = "";
      var trCusip = "";
      var trOriginalBalance = "";
      var DealID_TrancheRes;


      // querying tranche details for a dealid
      NewWSFSTrancheCCEmitter.on('updateNewWSFSTrancheCCDetails', function () {

        var getData = {
          peer: req.body.peers[0],
          fcn: "GetTrancheByDealID",
          args: '[\"' + toLowerCase(req.body.dealId) + '\"]'
        };
        logger.debug("---" + JSON.stringify(getData));
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortTrancheCC + '?' + require('querystring').stringify(getData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {

            if (!error && response.statusCode == 200) {
              //logger.debug("--------"+body);
              response = JSON.parse(body);

              if (response.DTOTranche.length > 0) {


                DealID_TrancheRes = {
                  "TrancheRes": response
                }
                logger.debug("Tranche Res:::::::::" + JSON.stringify(DealID_TrancheRes) + "size:::" + DealID_TrancheRes.TrancheRes.DTOTranche.length);

                for (var i = 0; i < DealID_TrancheRes.TrancheRes.DTOTranche.length; i++) {

                  trName = DealID_TrancheRes.TrancheRes.DTOTranche[i].trName;
                  trCusip = DealID_TrancheRes.TrancheRes.DTOTranche[i].trCusip;
                  trOriginalBalance = DealID_TrancheRes.TrancheRes.DTOTranche[i].trOriginalBalance;
                  TRID = DealID_TrancheRes.TrancheRes.DTOTranche[i].trID;
                  NewWSFSTrancheCCEmitterSave.emit('saveUpdateInitialSetDetails');

                }//end of for

              }
              else {

                NoDealID_TrancheCCEmitterSave.emit('saveNoDealID');
              }

              // res.send(response);
            } else {
              logger.debug(response.statusCode + response.body);
              //res.send({"isSuccess":false,"message":"Error occured while fetching Tranche Details!"});
              res.send({ token: -1 });

            }
          });
      });

  // updating details and saving it to bc
  NewWSFSTrancheCCEmitterSave.on('saveUpdateInitialSetDetails', function () {

    logger.debug("TRID------" + TRID);
    logger.debug("TRName------" + trName);
    logger.debug("trCusip------" + trCusip);
    logger.debug("trOriginalBalance------" + trOriginalBalance);

    var seqno = 0;
    for (var j = 0; j < req.body.trancheInput.length; j++) {

      seqno = seqno + 1;
      if (trName == req.body.trancheInput[j].trName) {
        flag = flag + 1;
        logger.debug("IF passed!!!");

      
        var postData = {
          peers: req.body.peers,
          fcn: "SaveTranche",
          args: [TRID, toLowerCase(req.body.dealId), req.body.trancheInput[j].name,req.body.trancheInput[j].cusip,req.body.trancheInput[j].originalbalance,
          req.body.userId, curDate,seqno.toString()]
        };
        logger.debug("Post Data::::::::::" + JSON.stringify(postData));
        request.post({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortTrancheCC,
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          },
          body: JSON.stringify(postData)
        },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              response = JSON.parse(body);
              logger.debug("Save Res@@@@@@@" + JSON.stringify(response));
              if (response.success == true) {
                logger.debug("\nentered success-- true!");
                sum = sum + 1;
                logger.debug(flag + "-----flag-------sum-----" + sum);
                if (flag == sum) {
                  res.send({ "isSuccess": true, "message": "Data Saved Successfully" });
                }

              }//end of  if(response.success == true){
              else {
                sum = sum + 1;
                if (flag == sum) {
                  res.send({ "isSuccess": false, "message": "Data not saved!" });
                }
              }


            } else {
              logger.debug(response.statusCode + response.body);
             // res.send({ "isSuccess": false, "message": "Data not saved!" });
             res.send({ token: -1 });

            }
          });
      }//end of  if(trNote == req.body.trancheInput[j].trNote)



    }//end of for

  });//end of NewWSFSTrancheCCEmitterSave

  // if no dealid found in bc,generating TRID and save it to bc
  NoDealID_TrancheCCEmitterSave.on('saveNoDealID', function () {

    var seqno = 0;
    console.log("size:::"+req.body.trancheInput.length);
    for (var k = 0; k < req.body.trancheInput.length; k++) {

      TRID = uuidv4();
      seqno = seqno + 1;
      logger.debug("TRID else:" + TRID);
      logger.debug("TRName--------------------------"+req.body.trancheInput[k].name);
      var postData = {
        peers: req.body.peers,
        fcn: "SaveTranche",
        args: [TRID, toLowerCase(req.body.dealId), req.body.trancheInput[k].name,req.body.trancheInput[k].cusip,
            req.body.trancheInput[k].originalbalance,req.body.userId, curDate,seqno.toString()]
      };
      logger.debug("Post Data::::::::::" + JSON.stringify(postData));
      request.post({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortTrancheCC,
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        },
        body: JSON.stringify(postData)
      },
        function (error, response, body) {
          logger.debug("Save Res@@@@@@@" + JSON.stringify(response));
          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);

            if (response.success == true) {
              
              flag2 = flag2 + 1;

              console.log("flag2::"+flag2);
              if (req.body.trancheInput.length == flag2) {
                res.send({ "isSuccess": true, "message": "Data Saved Successfully" });
              }

            }//end of  if(response.success == true)
            else {

              flag2 = flag2 + 1;

              if (req.body.trancheInput.length == flag2) {
                res.send({ "isSuccess": false, "message": "Data  Not Saved Successfully" });
              }
            }


          } else {
            logger.debug(response.statusCode + response.body);
           // res.send({ "isSuccess": false, "message": "Data Not Saved Successfully" });
           res.send({ token: -1 });

          }
        });

    }//end of for

  });

}//end of first else

},

  queryinitialsetup: function (req, res, next) {

    if (req.query.dealId == "") {

      res.send({ "isSuccess": false, "message": "Please enter the dealname!" });
    }
    else {

      var getData = {
        peer: req.query.peer,
        fcn: "GetInitialSetupByDealID",
        args: '[\"' + toLowerCase(req.query.dealId) + '\"]'
      };
      logger.debug("---" + JSON.stringify(getData)+"      api hit initialsetup");
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
            logger.debug("--------" + body);

            if (body.length > 4) {
              response = JSON.parse(body);
              res.send({ "isSuccess": false , "message": "DealName Already Exist!" });
            }
            else {
              res.send({ "isSuccess": true, "message": "DealName Not Exist!" });
            }

          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
    }
  },

  queryalldeals: function (req, res, next) {

    if (!req.query.peer || !req.query.token) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }
    else {

      var arr = [];

      var getData = {
        peer: req.query.peer,
        fcn: "GetAllDeals",
        args: '[\"' + req.query.peer + '\",\"' + req.query.token + '\"]'
      };
      logger.debug("---get all deals" + JSON.stringify(getData)+"     api hit query ");
      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesFortDealListCC + '?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.query.token
        }
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            logger.debug("--------" + body+"  "+body.length);

            if (body.length > 0) {

              response = JSON.parse(body);  
              logger.debug("res of query deals: "+JSON.stringify(response)+"  "+response.length)        

              for(var i=0;i<response.length;i++){
                console.log(String(response[i].DealId));
                if(String(response[i].DealId)!=""){
                  console.log("d:::"+String(response[i].DealId));
                  arr.push(response[i].DealId);
                  }
              }
               let uniqueChars = [...new Set(arr)];
               //logger.debug("Char" + uniqueChars[0]);
               logger.debug(uniqueChars);
               //logger.debug(typeof (uniqueChars));

              logger.debug("arr:"+JSON.stringify(arr))
              res.send(uniqueChars);
            }
            else {

              res.send(arr);
            }

          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
    }
  }
}

module.exports = trustee;
