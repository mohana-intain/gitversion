var request = require('request');

const fabricURL = process.env.charlesFortfabricURL;


var EventEmitter = require("events").EventEmitter;
var crypto = require('crypto');
const uuidv4 = require('uuid/v4');
var fs = require('fs');
const csv = require('csv-parser');
let nodemailer = require("nodemailer");
var generator = require('generate-password');
var toLowerCase = require('to-lower-case');
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

//generate salt
var genRandomString = function (length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

//logger.debug("RandomString:::"+genRandomString(10));

//hash password with salt
var sha512 = function (password, salt) {
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value
  };
};


//generate salt for a user, and hash his password with the salt
function saltHashPassword(userpassword) {
  var salt = genRandomString(16); /** Gives us salt of length 16 */
  logger.debug('UserPassword = ' + userpassword);
  logger.debug('Salt = ' + salt);
  var passwordData = sha512(userpassword, salt);

  logger.debug('Passwordhash = ' + passwordData.passwordHash);
  logger.debug('nSalt = ' + passwordData.salt);
  return passwordData;
}

var trusteeLogin = {
  // ------------------------------------------------ add trustee user ----------- in 3 channels ----------------------------------

  // addTrusteeUser 
  addTrusteeUser: function (req, res, next) {

    logger.debug(req.body);
    var userId = uuidv4();
    //30e1a106-ce7c-41f3-9607-6502f34a0346

    logger.debug("userID:" + userId);
    var addUserEmit = new EventEmitter();
    //hash the user password and return the hashed password and salt
    //var passwordData = saltHashPassword(req.body.Password);

    var UserRole = "";
    // var Token = "";
    var Peers = [process.env.peer + req.body.OrgName + process.env.peerExtension];

    //   peer1.originator.intainabs.emulya.com, peer2.originator.intainabs.emulya.com 
    // -------------------------------------------- getting the token -----------------------------------------
    var Token = "";


    var erro = 0;
    var count = 0;
    var erro2 = 0;
    var count2 = 0;

    var finalResponse = "";

    var addUserEmit = new EventEmitter();

    // -------------------------------------------- getting the token -----------------------------------------

    var getToken = {
      username: process.env.AdminUserName,
      orgName: process.env.TrusteeOrgName
    };




    request.post({
      uri: fabricURL + '/users',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: require('querystring').stringify(getToken)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          logger.debug("------------------------------IF---------------------------------------------------");
          response = JSON.parse(body);
          Token = response.token;
          count++;

          // tokenres = response;
          //  getAllRolesEmit.emit('get');

        } else {
          logger.debug("---------------------------------------------------------------------------------");
          logger.debug("token error:::::")
          logger.debug(response.statusCode + response.body);
          // res.send({ token: -1 });
          count++;

          erro = 1;
        }
      });

    function sayHi() {
      if (count == 1) {
        if (erro == 1) {
          res.status(400).send({ "message": "Missing Arguments!" });
        } else {
          logger.debug("count is now : " + count)
          addUserEmit.emit('add');

        }

      } else {
        callb();
      }
    }

    function callb() {
      setTimeout(sayHi, 1000);
    }

    setTimeout(sayHi, 1000);

    // -------------------------------------------- end of getting the token -----------------------------------



    addUserEmit.on('add', function () {

      var trustee_arr = [];

      var getData = {
        peer: process.env.peer + req.body.OrgName + process.env.peerExtension,
        fcn: "GetUserDetalsByUserNameAndOrgName",
        args: '[\"' + req.body.UserName + '\",\"' + req.body.OrgName + '\"]'
      };

      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC + '?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + Token
        }
        // rejectUnauthorized: false,
        // insecure:true
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {
          //logger.debug(body + "------------------------------------------------"+error);

          if (!error && response.statusCode == 200) {
            logger.debug(body);
            response = JSON.parse(body);
            //logger.debug(response.length)
            for (var i = 0; i < response.length; i++) {
              if (response[i].ApproveStatus == "Approved") {

                trustee_arr.push(response[i]);
              }
            }
            if (trustee_arr.length >= 2) {
              res.send("Please enter other username!!");          // check the response 
            }
            else if (trustee_arr.length == 1) {
              if (trustee_arr[0].UserID == userId.toString()) {
                logger.debug("user id's are equal in  UMB !!")
                userId = trustee_arr[0].UserID;
                logger.debug("inside len 1 in  6:  " + userId);

              }
              function1();
            }
            else {
              function1();
            }
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });


      function function1() {

        var postData = {
          peers: Peers,
          fcn: "CreateUser",
          args: [userId, req.body.UserName, "", req.body.OrgName, req.body.EmailId, "", req.body.UserRoleID, "", "", "", "", "Pending"]
        };
        logger.debug(userId);

        request.post({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC,
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + Token
          },
          body: JSON.stringify(postData)
        },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              logger.debug(body);
              response = JSON.parse(body);
              finalResponse = response;
              //  res.send(response);
              count2++;
            } else {
              logger.debug(response.statusCode + response.body);
              // res.send({ token: -1 });
              count2++;
              erro2 == 1
            }
          });
      }
    }); // end of Emit


    function sayHello() {
      if (count2 == 1) {
        if (erro2 == 1) {
          res.status(400).send({ "message": "Missing Arguments!" });
        } else {
          logger.debug("final data response place");
          res.send(finalResponse);

        }

      } else {
        callbc();
      }
    }

    function callbc() {
      setTimeout(sayHello, 1000);
    }

    setTimeout(sayHello, 1000);


  },

  //approve the user
  approveTrusteeUser: function (req, res, next) {

    // -------------------------------------------- getting the token -----------------------------------------

    var erro2 = 0;
    var count2 = 0;

    var finalResponse = "";

    approveUserEmit();
    // -------------------------------------------- end of getting the token -----------------------------------

    function approveUserEmit() {


      var userDataEmit = new EventEmitter();
      var responseTxID = new EventEmitter();
      var createToken = new EventEmitter();
      var email = new EventEmitter();
      var outString = "";
      var arr = [];
      var arr2 = [];
      var flag1 = 0;
      var sum1 = 0;
      var userIDs = req.body.UserID;
     
      var flag = 0;
      var sum = 0;
      logger.debug("userid::" + userIDs);
      // var userIdArray = [];
      // userIdArray.push(userIDs.split("#"));
      var userIdArray = userIDs.split("#");
      logger.debug("userIdArray:" + userIdArray);
      logger.debug("Length of User ID Array:::::" + userIdArray.length);
      //logger.debug(req.query);
      for (var i = 0; i < userIdArray.length; i++) {
        var getData = {
          peer: req.body.peers[0],
          fcn: "GetUser",
          args: '[\"' + userIdArray[i] + '\"]'
        };

        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC + '?' + require('querystring').stringify(getData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // rejectUnauthorized: false,
          // insecure:true
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {
            logger.debug(body + "------------------------------------------------" + error);
            if (!error && response.statusCode == 200) {

              createToken.data = JSON.parse(body);
              //arr.push(userDataEmit.data);

              //if(arr.length == userIdArray.length){
              //userDataEmit.emit('userData');
              createToken.emit('userData');
              //}
              // userDataEmit.data = JSON.parse(body);
              //userDataEmit.emit('userData');
              logger.debug(flag + ":::flag");

              flag = flag + 1;

            } else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          });



      }
      outString = "";

      createToken.on('userData', function () {

        for (var j = 0; j < createToken.length; j++)
          logger.debug("CREATE TOKEN DATA-----------1---------------" + JSON.stringify(createToken.data));
        arr.push(createToken.data);
        var getToken = {
          username: createToken.data.UserName,
          orgName: createToken.data.OrgName
        };
        request.post({
          uri: fabricURL + '/users',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: require('querystring').stringify(getToken)
          //   rejectUnauthorized: false,
          //   insecure:true
        },
          function (error, response, body) {

            if (!error && response.statusCode == 200) {
              response = JSON.parse(body);
              userDataEmit.data = createToken.data;
              userDataEmit.emit('userData');

            } else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          });

      });// end of create token 


      userDataEmit.on('userData', function () {
        logger.debug("USEREMITDATA------2---------" + JSON.stringify(userDataEmit.data));
        logger.debug("Array valuess for users---------" + JSON.stringify(arr));

        var data = {
          usrData: arr
        }


        for (var i = 0; i < arr.length; i++) {
          var postData = {
            peers: req.body.peers,
            fcn: "CreateUser",
            args: [data.usrData[i].UserID, data.usrData[i].UserName, data.usrData[i].Password, data.usrData[i].OrgName, data.usrData[i].EmailID,
            data.usrData[i].PwdSalt, data.usrData[i].UserRoleID, data.usrData[i].FirstName, data.usrData[i].LastName, data.usrData[i].MobileNumber,
            data.usrData[i].Country, req.body.ApproveStatus]
          };
          // logger.debug("Rejectedd------------------------------")
          logger.debug("--------------------after adding loop" + JSON.stringify(postData));
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postData)
            // rejectUnauthorized: false,
            // insecure:true
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                email.data = body;
                // arr2.push(body);

                email.emit('emailData');



                // ---------------------------------------sending mail --------------------------------------------------------------

                //SENDING MAIL
                // logger.debug("email id :::" + data.usrData[i].EmailID);

                // res.send(response);
              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }

            });
          flag1 = flag1 + 1;
        }//for loop  
      });
      email.on('emailData', function () {
        sum1 = sum1 + 1;
        logger.debug("flag::::::=====" + flag1);
        logger.debug("sum:::::::=====" + sum1);
        if (flag1 == sum1) {
          logger.debug("Email sent------------------");

          for (var i = 0; i < userIdArray.length; i++) {
            logger.debug("inside loop iteration------------");
            logger.debug("length------" + userIdArray.length);
            logger.debug("emailId---------" + arr[i].EmailID);
            var data = {
              usrData: arr
            }
            var mailString = "";

            mailString = "Hi,<br/> your registration request has been  " + req.body.ApproveStatus + " for the username : " + data.usrData[i].UserName + " and the organisation name : " + data.usrData[i].OrgName +
              " Please use the following URL to access the platform <br/> URL is :  https://umbtest.intainabs.com/update-profile?UserName=" + data.usrData[i].UserName + "&OrgName=" + data.usrData[i].OrgName + "<br/> Note: this is system generated mail please don't reply."

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
              to: data.usrData[i].EmailID,
              subject: `Intain Platform Approval Status`,
              html: mailString
            };
            logger.debug("mailOptions::" + JSON.stringify(mailOptions));

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                // throw error;
                logger.debug(error + "Email : " + data.usrData[i].EmailID);
              } else {
                logger.debug("Email successfully sent!");
              }
            });
            logger.debug("iterationn----------" + i);
          }//for
        }//if

        // end of mail
        // --------------------------------------end of sending mail -------------------------------------------------------------------

        var body = email.data;
        logger.debug("bodyyyyyyy---------" + body);


        // logger.debug(arr2 + "+++++++++++++++++++++++++++++++++++++++++++++++++++++");
        response = JSON.parse(body);
        finalResponse = response;

        sum++;
        if (flag == sum) {
          count2++;
        }


      });
    }; // end of approve user emit


    function sayHello() {
      logger.debug("---------Hello-----------" + count2);
      if (count2 == 1) {
        if (erro2 == 1) {
          res.status(400).send({ "message": "Missing Arguments!" });
        } else {
          logger.debug("final data response place");

          res.send(finalResponse);

        }

      } else {
        callbc();
      }
    }

    function callbc() {
      setTimeout(sayHello, 1000);
    }

    setTimeout(sayHello, 1000);
  },

  //---------------------------------------------------------add approved user details ----------------------------------------------

  addApprovedTrusteeUserDetails: function (req, res, next) {

    logger.debug(req.body);


    if (!req.body.UserName || !req.body.Password || !req.body.OrgName ||
      !req.body.FirstName || !req.body.LastName ||
      !req.body.MobileNumber || !req.body.Country) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var approvedUserEmit = new EventEmitter();

      var Peers = [process.env.peer + req.body.OrgName + process.env.peerExtension];

      //hash the user password and return the hashed password and salt
      //var passwordData = saltHashPassword(req.body.Password);
      var Token = "";

      var erro = 0;
      var count = 0;
      var erro2 = 0;
      var count2 = 0;

      var userDetails = new EventEmitter();


      // -------------------------------------------- getting the token -----------------------------------------

      var getToken = {
        username: process.env.AdminUserName,
        orgName: process.env.TrusteeOrgName
      };

      request.post({
        uri: fabricURL + '/users',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: require('querystring').stringify(getToken)
        // rejectUnauthorized: false,
        // insecure:true
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            logger.debug("------------------------------IF---------------------------------------------------");
            response = JSON.parse(body);
            logger.debug("token::: " + JSON.stringify(response));
            Token = response.token;
            // tokenres = response;
            // getAllRolesEmit.emit('get');
            count++;

          } else {
            logger.debug("---------------------------------------------------------------------------------");
            logger.debug(response.statusCode + response.body);
            //  res.send({ token: -1 });
            count++;

            erro = 1;
          }
        });



      function sayHi() {
        if (count == 1) {
          if (erro == 1) {
            res.status(400).send({ "message": "Missing Arguments!" });
          } else {
            logger.debug("count is 1 now")
            userDetails.emit('update');
          }

        } else {
          callb();
        }
      }

      function callb() {
        setTimeout(sayHi, 1000);
      }

      setTimeout(sayHi, 1000);

      // -------------------------------------------- end of getting the token -----------------------------------

      userDetails.on('update', function () {
        logger.debug(Peers[0] + "::::::::::::::::");
        var getData = {
          peer: Peers[0],
          fcn: "GetUserDetalsByUserNameAndOrgName",
          args: '[\"' + req.body.UserName + '\",\"' + req.body.OrgName + '\"]'
        };
        logger.debug(JSON.stringify(getData) + "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        request.get({
          uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC + '?' + require('querystring').stringify(getData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + Token
          }
          //   rejectUnauthorized: false,
          //   insecure:true
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {
            if (!error && response.statusCode == 200 && body.length > 4) {
              try {
                logger.debug("BODY:::" + body);
                approvedUserEmit.data = JSON.parse(body);
                approvedUserEmit.emit('add');
              } catch (e) {
                res.send(e)
              }

            }  //if Not authenticated =>(the username or password is invalid)
            else {
              // res.sendStatus(204);
              erro2 = 1;
            }
            //  }
          });


      });

      // ------------------------------------------------------- end of getting the details from UserCC ------------------------------------
      approvedUserEmit.on('add', function () {
        logger.debug("--------------------------------------------------------------------------------------");
        logger.debug(approvedUserEmit.data);
        logger.debug("--------------------------------------------------------------------------------------");
        var passwordData = saltHashPassword(req.body.Password);
        var approve_check;
        var approve_count = 0;

        for (var a = 0; a < approvedUserEmit.data.length; a++) {

          if (req.body.OrgName == process.env.TrusteeOrgName && approvedUserEmit.data[a].ApproveStatus == "Approved") {
            approve_check = approvedUserEmit.data[a];
            approve_count = 1;
            break;
          }
        }

        if (approve_count == 1) {

          logger.debug("status is approved  " + approve_check.UserID);

          var saveData = {
            peers: Peers,
            fcn: "CreateUser",
            args: [approve_check.UserID, approve_check.UserName, passwordData.passwordHash,
            approve_check.OrgName, approve_check.EmailID, passwordData.salt, approve_check.UserRoleID,
            req.body.FirstName, req.body.LastName, req.body.MobileNumber, req.body.Country,
            approve_check.ApproveStatus]
          };
          logger.debug(JSON.stringify(saveData) + "____________________________________________________");
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + Token
            },
            body: JSON.stringify(saveData)
            // rejectUnauthorized: false,
            // insecure:true
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                response = JSON.parse(body);
                // res.send(response);
                count2++;
                finalResponse = response;
              } else {
                logger.debug(response.statusCode + response.body);
                //  res.send({ token: -1 });
                erro2 = 1;
                count2++;
              }
            });

        } //end of if
        else {
          //  res.sendStatus(204);
          erro2 = 1;
          count2++;
        }


      }); // end of addUserEmit


      function sayHello() {
        if (count2 == 1) {
          if (erro2 == 1) {
            res.status(400).send({ "message": "Missing Arguments!" });
          } else {
            logger.debug("final data response place");

            res.send(finalResponse);

          }

        } else {
          callbc();
        }
      }

      function callbc() {
        setTimeout(sayHello, 1000);
      }

      setTimeout(sayHello, 1000);


    }// end of else


  }

  //---------------------------------------------------------end of add approved details ---------------------------------------------------------


};
module.exports = trusteeLogin;
