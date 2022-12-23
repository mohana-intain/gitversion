var request = require('request');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
// const fabricURL = 'https://charlesfort-internal.umbprod.intainabs.com';
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


var login = {

  //login by username and orgname
  login: function (req, res, next) {
    logger.debug(req.body);
    //  var username = req.body.UserName;
    //check for the args
    if (!req.body.UserName || !req.body.OrgName) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }
    else {
      var postData = {
        username: toLowerCase(req.body.UserName),
        orgName: req.body.OrgName
      };
      request.post({
        uri: fabricURL + '/authenticateUser',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: require('querystring').stringify(postData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            res.send(response);
            // res.json({"username":username,"response":response});
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
    }//end of else
  },
  authenticate: function (req, res, next) {
    //check for the args
    if (!req.body.UserName || !req.body.OrgName || !req.body.Password) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }
    else {

      var resMessage = {};
      logger.debug(":::" + JSON.stringify(req.body));

      var userDetails = new EventEmitter();
      var authenticateEmit = new EventEmitter();
      var tokenres = {};
      var Token = "";
      var Peers = [process.env.peer + req.body.OrgName + process.env.peerExtension];
      // -------------------------------------------- getting the token -----------------------------------------

      var getToken = {
        username: req.body.UserName,
        orgName: req.body.OrgName
      };

      console.log("token:::" + JSON.stringify(getToken));
      request.post({
        uri: fabricURL + '/authenticateUser',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: require('querystring').stringify(getToken)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            Token = response.token;
            console.log("token::" + Token);
            tokenres = response;
            if (tokenres.success == true) {  // checking the identity with CA

              authenticateEmit.emit('authenticate');
            } else {
              res.sendStatus(204);
            }
            // res.send(response);
            // res.json({"username":username,"response":response});
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
      // -------------------------------------------- end of getting the token -----------------------------------
      authenticateEmit.on('authenticate', function () {
        //Getting the userdetails by username and orgname

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
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {
            if (!error && response.statusCode == 200 && body.length > 4) {
              try {
                logger.debug("BODY:::" + body);
                userDetails.data = JSON.parse(body);
                userDetails.emit('update');
              } catch (e) {
                res.send(e)
              }

            }  //if Not authenticated =>(the username or password is invalid)
            else {
              res.sendStatus(204);
            }
            //  }
          });

      }); // end of authenticate emiter

      userDetails.on('update', function () {
        logger.debug('response: ' + JSON.stringify(userDetails.data)); // HOORAY! THIS WORKS!
        var usr;
        usr = {
          usrDetails: userDetails.data
        }
        logger.debug("USER DETAILS::" + JSON.stringify(usr));
        logger.debug('usr ' + usr.usrDetails[0].PwdSalt);
        //  for(var i=0;i<usr.usrDetails.length;i++){

        var passwordData = sha512(req.body.Password, usr.usrDetails[0].PwdSalt);
        logger.debug(passwordData.passwordHash + "::user hash");
        logger.debug(usr.usrDetails[0].Password + "::hash from BC");
        logger.debug(usr.usrDetails[0].ApproveStatus);
        // var str = usr.usrDetails[0].DealType;
        // var str1 = [];
        // str1= str.split(",");
        // usr.usrDetails[0].DealType = str1;
        // logger.debug("user details------: " + JSON.stringify(usr.usrDetails[0]));
        // //logger.debug("str1 array::::::"+str1[0]);
        // logger.debug(usr.usrDetails[0].DealType[0]);
        //if authenticated
        if (usr.usrDetails[0].Password === passwordData.passwordHash) {

          logger.debug("inside is condition -----------------------------------------------------");

          resMessage = { "data": usr.usrDetails[0], "response": tokenres };
          res.send(resMessage);
        }
        else {
          res.sendStatus(204);
        }

      });
    }// end of else
  },


  getUserByUserRoleName: function (req, res, next) {


    var userRoleDetails = new EventEmitter();
    logger.debug(req.query);
    // Querying UserRoleCC to get the RoleID
    var getData = {
      peer: req.query.peer,
      fcn: "GetUserByRoleName",
      args: '[\"' + req.params.userRoleName + '\"]'
    };
    logger.debug("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserRoleCC + '?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }

    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          logger.debug(body);
          userRoleDetails.data = JSON.parse(body);
          userRoleDetails.emit('userRole');
        } else {
          logger.debug(response.statusCode + response.body);
          res.send({ token: -1 });
        }
      });


    userRoleDetails.on('userRole', function () {

      var data = {
        userRoleData: userRoleDetails.data
      }


      var getUserData = {
        peer: req.query.peer,
        fcn: "GetUserByRoleID",
        args: '[\"' + data.userRoleData.UserRoleID + '\"]'
      };
      logger.debug("---" + JSON.stringify(getUserData));
      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC + '?' + require('querystring').stringify(getUserData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.query.token
        }
        // body:require('querystring').stringify(getUserData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            logger.debug(body);
            response = JSON.parse(body);
            res.send(response);
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });

    });
  },
  //adding users 
  addUser: function (req, res, next) {

    logger.debug(req.body);
    var userId = uuidv4();
    logger.debug("userID:" + userId);
    var addUserEmit = new EventEmitter();
    //hash the user password and return the hashed password and salt
    //var passwordData = saltHashPassword(req.body.Password);

    var UserRole = "";
    var Token = "";
    var Peers = [process.env.peer + req.body.OrgName + process.env.peerExtension];

    //   peer0.originator.intainabs.emulya.com, peer2.originator.intainabs.emulya.com 
    // -------------------------------------------- getting the token -----------------------------------------

    var getToken = {
      username: process.env.AdminUserName,
      orgName: req.body.OrgName
    };
    request.post({
      uri: fabricURL + '/users',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: require('querystring').stringify(getToken)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          Token = response.token;
          logger.debug(JSON.stringify(response));
          // tokenres = response;
          addUserEmit.emit('add');

        } else {
          logger.debug(response.statusCode + response.body);
          res.send({ token: -1 });
        }
      });
    // -------------------------------------------- end of getting the token -----------------------------------

    addUserEmit.on('add', function () {
      if (!req.body.UserName || !req.body.OrgName || !req.body.UserRoleID || !Token) {
        res.status(400).send({ "message": "Missing Arguments!" });
      }
      else {
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
              res.send(response);
            } else {
              logger.debug(response.statusCode + response.body);
              res.send({ token: -1 });
            }
          });
      } // end of else
    }); // end of addUserEmit

  },
  //registering the user
  addRegisteredUser: function (req, res, next) {

    logger.debug(req.body);
    var userId = uuidv4();
    logger.debug("userID:" + userId);
    var addUserEmit = new EventEmitter();

    var UserRole = "";
    var Token = "";
    var Peers = [process.env.peer + req.body.OrgName + process.env.peerExtension];
    //  peer0.originator.intainabs.emulya.com, peer2.originator.intainabs.emulya.com 
    // -------------------------------------------- getting the token -----------------------------------------

    var getToken = {
      username: process.env.AdminUserName,
      orgName: req.body.OrgName
    };
    request.post({
      uri: fabricURL + '/users',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: require('querystring').stringify(getToken)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          Token = response.token;
          // tokenres = response;
          addUserEmit.emit('add');

        } else {
          logger.debug(response.statusCode + response.body);
          res.send({ token: -1 });
        }
      });
    // -------------------------------------------- end of getting the token -----------------------------------

    addUserEmit.on('add', function () {


      var postData = {
        peers: Peers,
        fcn: "CreateUser",
        args: [userId, req.body.UserName, "", req.body.OrgName, "", "", req.body.UserRoleID, "", "", "", "", "Approved"]
      };

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
            response = JSON.parse(body);
            res.send(response);
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });

    }); // end of addUserEmit

  },

  //---------------------------------------------------------add approved user details ----------------------------------------------

  addApprovedUserDetails: function (req, res, next) {

    logger.debug(req.body);


    if (!req.body.UserName || !req.body.Password || !req.body.OrgName ||
      !req.body.FirstName || !req.body.LastName ||
      !req.body.MobileNumber || !req.body.Country) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var approvedUserEmit = new EventEmitter();
      var userDetails = new EventEmitter();
      var approvedUserEmit = new EventEmitter();
      //hash the user password and return the hashed password and salt
      //var passwordData = saltHashPassword(req.body.Password);


      var Token = "";
      var Peers = [process.env.peer + req.body.OrgName + process.env.peerExtension];

      //   peer0.originator.intainabs.emulya.com, peer2.originator.intainabs.emulya.com 
      // -------------------------------------------- getting the token -----------------------------------------

      var getToken = {
        username: req.body.UserName,
        orgName: req.body.OrgName
      };
      request.post({
        uri: fabricURL + '/authenticateUser',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: require('querystring').stringify(getToken)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            console.log("res:: " + response);
            Token = response.token;
            logger.debug(JSON.stringify(response));
            // tokenres = response;
            // 
            console.log(Token);
            if (response.success == true) {
              userDetails.emit('update');
            } else {
              res.sendStatus(204);
            }

          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
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
              res.sendStatus(204);
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

        if (approvedUserEmit.data[0].ApproveStatus == "Approved") {
          logger.debug("status is approved");

          var saveData = {
            peers: Peers,
            fcn: "CreateUser",
            args: [approvedUserEmit.data[0].UserID, approvedUserEmit.data[0].UserName, passwordData.passwordHash,
            approvedUserEmit.data[0].OrgName, approvedUserEmit.data[0].EmailID, passwordData.salt, approvedUserEmit.data[0].UserRoleID,
            req.body.FirstName, req.body.LastName, req.body.MobileNumber, req.body.Country,
            approvedUserEmit.data[0].ApproveStatus]
          };
          logger.debug(JSON.stringify(saveData) + "____________________________________________________");
          request.post({
            uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserCC,
            headers: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + Token
            },
            body: JSON.stringify(saveData)
          },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                response = JSON.parse(body);
                res.send(response);
              } else {
                logger.debug(response.statusCode + response.body);
                res.send({ token: -1 });
              }
            });

        } //end of if
        else {
          res.sendStatus(204);
        }


      }); // end of addUserEmit

    }// end of else

  },

  //---------------------------------------------------------end of add approved details ---------------------------------------------------------

  getUser: function (req, res, next) {
    logger.debug(req.query);
    var getData = {
      peer: req.query.peer,
      fcn: "GetUser",
      args: '[\"' + req.params.userId + '\"]'
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
          logger.debug(body);
          response = JSON.parse(body);
          res.send(response);
        } else {
          logger.debug(response.statusCode + response.body);
          res.send({ token: -1 });
        }
      });
  },

  // ---------------------------------------get user by orgname API -------------------------------------------------
  getUserByOrgName: function (req, res, next) {
    logger.debug(req.query);
    if (!req.query.token || !req.params.OrgName || !req.query.peer) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {

      var getData = {
        peer: req.query.peer,
        fcn: "GetUserDetailsByOrgName",
        args: '[\"' + req.params.OrgName + '\"]'
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
            logger.debug(body);
            response = JSON.parse(body);
            res.send(response);
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });

    }
  },

  // ---------------------------------------end of get user by orgname ------------------------------------------------------------

  //approve the user
  approveUser: function (req, res, next) {


    if (!req.body.token || !req.body.peers || !req.body.UserID || !req.body.ApproveStatus) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    // else if(req.body.ApproveStatus=="Approved" && req.body.DealType==""){
    //   res.status(400).send({ "message": "Missing Arguments!" });
    // }
    else {

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
      // var DealType = req.body.DealType;
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
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {

            if (!error && response.statusCode == 200) {
              // logger.debug(body + "------------------------------------------------");
              createToken.data = JSON.parse(body);
              createToken.emit('userData');
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
        //     var datasample=
        //     {
        //       user:arr
        //     }
        // logger.debug("sample--------"+JSON.stringify(datasample));
        // logger.debug("accessing variable-----"+datasample.user[0].UserID);
        var data = {
          usrData: arr
        }
        // logger.debug("dataaaaa comming in emit--------"+JSON.stringify(userDataEmit.data));
        // logger.debug("dataaaaa --------"+JSON.stringify(data));

        // if(DealType==undefined){
        //   DealType = ""
        // }

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
          //       logger.debug("EMAIL EMIT DATA--------"+email.data);      
          //       logger.debug("arrrayyyyyy-----"+JSON.stringify(arr));
          //       logger.debug("iteration----------"+i);
          //       // logger.debug("array first-----"+arr[0].EmailID);
          //       // logger.debug("array first-----"+arr[1].EmailID);
          //       // logger.debug("emailId---------"+arr[i].EmailID);
          for (var i = 0; i < userIdArray.length; i++) {
            logger.debug("inside loop iteration------------");
            logger.debug("length------" + userIdArray.length);
            logger.debug("emailId---------" + arr[i].EmailID);
            var data = {
              usrData: arr
            }
            var mailString = "";

            if (req.body.ApproveStatus == "Approved" && data.usrData[i].OrgName != process.env.charlesfortInvestorOrgName) {
              mailString = "Hi,<br/> your registration request has been  " + req.body.ApproveStatus + " for the username : " + data.usrData[i].UserName + " and the organisation name : " + data.usrData[i].OrgName + " Please use the following URL to access the platform <br/> URL is : https://umbtest.intainabs.com/update-profile?UserName=" + data.usrData[i].UserName + "&OrgName=" + data.usrData[i].OrgName + "<br/> Note: this is system generated mail please don't reply."
            }
            else if (req.body.ApproveStatus == "Approved" && data.usrData[i].OrgName == process.env.charlesfortInvestorOrgName) {
              mailString = "Hi,<br/> your registration request has been  " + req.body.ApproveStatus + " for the username : " + data.usrData[i].UserName + " and the organisation name : " + data.usrData[i].OrgName + " Please use the following URL to access the platform <br/> URL is : https://umbtest.intainabs.com/update-profile?UserName=" + data.usrData[i].UserName + "&OrgName=" + data.usrData[i].OrgName + "<br/> Note: this is system generated mail please don't reply.<br/> Please note that You cannot login until the trustee assigns the dealtype."
            }
            else {
              mailString = "Hi,<br/> your registration request has been  " + req.body.ApproveStatus + " for the username : " + data.usrData[i].UserName + " and the organisation name : " + data.usrData[i].OrgName + " Please use the following URL to access the platform <br/> URL is : https://umbtest.intainabs.com/update-profile?UserName=" + data.usrData[i].UserName + "&OrgName=" + data.usrData[i].OrgName + "<br/> Note: this is system generated mail please don't reply."

            }
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

        sum = sum + 1;
        responseTxID.data = response.TransactionID;
        logger.debug(responseTxID.data + "::::::::::::::::::::::::::::::::::::::::");
        responseTxID.emit('updateRes', response.TransactionID);

      })

      responseTxID.on('updateRes', function (TxID) {

        if (outString == "") {
          //outString = tid
          outString = responseTxID.data;
          logger.debug("outString::" + TxID);

        }
        else {
          //outString = outString + , + tid
          outString = outString + "," + responseTxID.data;
          // logger.debug("outString::"+outString);
          //  responseTxID.data = outString;
          //  responseTxID.emit('updateRes');
        }

        logger.debug(flag + "+++++++flag");
        logger.debug(sum + "+++++sum");
        if (flag == sum) {
          let before1 = new Date();
          logger.debug("before1:::" + before1);

          setTimeout(function () {
            initial(req);
          }, 2000);
          //send the respone


          var data = {
            response: "Transaction got committed with ids: " + outString.toString(),
            success: "true"
          }

          function initial() {
            res.send(JSON.stringify(data));
            // logger.debug(JSON.stringify(msg));
            let after1 = new Date();
            logger.debug("after:::" + after1);
          }
          // res.send(JSON.stringify(data));
        }

      });

    } // end of else
    // });

  },

  //get all the users
  getAllUsers: function (req, res, next) {
    logger.debug(req.query);
    //check for the args
    if (!req.query.peer || !req.query.token) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }

    else {
      var getData = {
        peer: req.query.peer,
        fcn: "GetAllUsers",
        args: '[\"\"]'
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
            logger.debug(body);
            response = JSON.parse(body);
            res.send(response);
          } else {
            logger.debug(response.statusCode + response.body);
            res.send({ token: -1 });
          }
        });
    }  // end of else
  },
  //getting the user details by username
  getUserByUsername: function (req, res, next) {
    logger.debug(req.query);

    var getData = {
      peer: req.query.peer,
      fcn: "GetUserByUsername",
      args: '[\"' + req.params.userName + '\"]'
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
          logger.debug(body);
          response = JSON.parse(body);
          res.send(response);
        } else {
          logger.debug(response.statusCode + response.body);
          res.send({ token: -1 });
        }
      });

  },

  getUserByEmailID: function (req, res, next) {
    logger.debug(req.query);

    var getData = {
      peer: req.query.peer,
      fcn: "GetUserByEmailID",
      args: '[\"' + req.params.emailId + '\"]'
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
          logger.debug(body);
          response = JSON.parse(body);
          res.send(response);
        } else {
          logger.debug(response.statusCode + response.body);
          res.send({ token: -1 });
        }
      });

  }

};

module.exports = login;