var request = require('request');
//const uuidv4 = require('uuid/v4');
const fabricURL = process.env.charlesFortfabricURL;
let nodemailer = require("nodemailer");
const EventEmitter = require('events');
var toLowerCase = require('to-lower-case');

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";


var reportstatus = {

  savepublishdetails: function (req, res, next) {

    var emit1 = new EventEmitter();
    var savedealpublish = new EventEmitter();
    var InvestorReportCCEmitter = new EventEmitter();
    
    logger.debug(req.body);

    //check for the args
    if (!req.body.DealID || !req.body.Status || !req.body.peers || !req.body.token || !req.body.month || !req.body.year || !req.body.version) {
      res.status(400).send({ "message": "Missing Arguments!" })
    }
    else {

      var str = [];
      var dealId = toLowerCase(req.body.DealID);


    var month;
    var year;

    if(parseInt(req.body.month) == 1){
      month = 12;
      year = parseInt(req.body.year)-1;
    }
    else{
      month = parseInt(req.body.month)-1;
      year = parseInt(req.body.year);
    }
      //check for the month dealid and retrieve the id 
      var getData = {
        peer: req.body.peers[0],
        fcn: "GetDealPublishByMonthDealYear",
        args: '[\"' + month.toString() + '\",\"' + dealId + '\",\"' + year.toString() + '\"]' //passing "dealId" as parameter in the API Call
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
            logger.debug("response from deal publish audit:::::::::::\n\n "+JSON.stringify(response))
            // var v = req.body.version;
            // var str = v.split(" ");
            // var version = parseInt(str[1]) - 1;
            // logger.debug("str in version:::::::::::::::::::\n\n"+version);
            savedealpublish.emit("savedealpublish", response[0].ID,response[0].User,response[0].Version);
          }
          else {
            res.send({ token: -1 });
          }

        })
    } // end of else


    // update the status=1 for the dealid and month
    savedealpublish.on("savedealpublish", function (irId,user,version) {
      var postData = {
        peers: req.body.peers,
        fcn: "SaveDealPublish",
        args: [irId, month.toString(), toLowerCase(req.body.DealID), req.body.Status,user,year.toString(),version]
      };
      logger.debug("postdata++++++" + JSON.stringify(postData));
      request.post({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortDealPublishAuditTrialCC,
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
              logger.debug("Data Saved");
              if (req.body.Status == "1") {

                emit1.emit("getuser",user);
                res.send("Data Saved!");

              } else {

              }
            }
            else if (response.success == false) {
              res.send("Data not saved!");
              // res.sendStatus(204);
            }

          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
    })

    emit1.on("getuser",function(user){

      var inv = "";
      str = user.split(",");
      for(var i=0;i<str.length;i++){
        inv = str[i];
        InvestorReportCCEmitter.emit("getinv",inv,toLowerCase(req.body.DealID),month);
      }

    })

    InvestorReportCCEmitter.on("getinv",function(inv,dealid,month){

      var DealType = "UMB";

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
              var mailString = "Hi," + "<br/>   The report has been published and you may have a look at it for the dealid = " + req.body.DealID + ", month = "+req.body.month+", year = "+req.body.year +".<br/>Regards,<br/>UMB Trustee!"
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
    })
  },



  //query by month and dealid for the status=0/1 from bc 
  gettrusteereportstatusbyid: function (req, res, next) {
    logger.debug(req.query);

    logger.debug(req.query.DealID);

    if (!req.query.DealID || !req.query.peer || !req.query.token || !req.query.month || !req.query.year 
      || !req.query.version || !req.query.data) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }
    else {


    var month;
    var year;
   
    if(parseInt(req.query.month) == 1){
      month = 12;
      year = parseInt(req.query.year) - 1;
     
    }
    else{
      month = parseInt(req.query.month)-1;
      year = parseInt(req.query.year);
    }

    // investor - view report
    if(req.query.version == "null"){

      var getData = {
        peer: req.query.peer,
        fcn: "GetDealPublishByMonthDealYear",
        args: '[\"' + month.toString() + '\",\"' + toLowerCase(req.query.DealID) + '\",\"' + year.toString() + '\"]'  //passing "dealId" as parameter in the API Call
        //token: req.query.token
      };
      logger.debug("getDataaa++++++" + JSON.stringify(getData));
      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortDealPublishAuditTrialCC + '?' + require('querystring').stringify(getData),
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
              logger.debug(JSON.stringify(response));

              if(response[0].Status == "0" && response[0].Version == "Version 1"){
                res.send("0");  // no report found
              }
              else{
                res.send("1");    // next api hit
              }
            }
            else {
              logger.debug("No data found!");
              res.sendStatus(204);   // report not generated
            }

          } else {
            // logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
     
    }
    else{
   
      var versionarr = (req.query.data).split(",");
      var versionlength = versionarr.length; 
      logger.debug("length::   "+versionlength)

      var ver1 = (req.query.version).split(" ");
      var version = ver1[1];
      if(version < versionlength){
        res.send("1");
      }
      else{


        var getData = {
          peer: req.query.peer,
          fcn: "GetDealPublishByMonthDealYear",
          args: '[\"' + month.toString() + '\",\"' + toLowerCase(req.query.DealID) + '\",\"' + year.toString() + '\"]'  //passing "dealId" as parameter in the API Call
          //token: req.query.token
        };
        logger.debug("getDataaa++++++" + JSON.stringify(getData));
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortDealPublishAuditTrialCC + '?' + require('querystring').stringify(getData),
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
                logger.debug(JSON.stringify(response));
                if(response[0].Status == "1"){
                  res.send("1");
                }
                else{
                  res.send("0");
                }
              }
              else {
                logger.debug("No data found!");
                res.sendStatus(204);   // report not generated
              }
  
            } else {
              // logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          });
      }
      
      }
    }

  },


  //query by month and dealid for the status=0/1 from bc 
  gettrusteereportstatusLoanStratbyid: function (req, res, next) {
    logger.debug(req.query);

    logger.debug(req.query.DealID);

    if (!req.query.DealID || !req.query.peer || !req.query.token || !req.query.month || !req.query.year || !req.query.role) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }
    else {

      var role = req.query.role;

      var getData = {
        peer: req.query.peer,
        fcn: "GetDealPublishByMonthDealYear",
        args: '[\"' + req.query.month + '\",\"' + toLowerCase(req.query.DealID) + '\",\"' + req.query.year + '\"]'  //passing "dealId" as parameter in the API Call
        //token: req.query.token
      };
      logger.debug("getDataaa++++++" + JSON.stringify(getData));
      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortDealPublishAuditTrialCC + '?' + require('querystring').stringify(getData),
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
              logger.debug(JSON.stringify(response));
              if(response[0].Status == "0" && response[0].Version == "Version 1"){
                if(role == process.env.TrusteeOrgName){
                    res.send("1");  
                }
                else{
                    res.send("0");  // no report found
                } 
              }
              else{
                res.send("1");    // next api hit
              }
            }
            else {
              logger.debug("No data found!");
              res.sendStatus(204);   // report not generated
            }

          } else {
            // logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
    }

  }
};

module.exports = reportstatus;


