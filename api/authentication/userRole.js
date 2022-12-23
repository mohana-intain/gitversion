var request = require('request');
const uuidv4 = require('uuid/v4');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
var EventEmitter = require("events").EventEmitter;


var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";


var distance = {
  login: function (req, res, next) {
    logger.debug(req.body);
    var postData = {
      username: req.body.username,
      orgName: req.body.orgName
    };
    request.post({
      uri: fabricURL + '/users',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: require('querystring').stringify(postData)
    },
      function (error, response, body) {
        console.log("body:::"+body);
        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          res.send(response);
        } else {
          logger.debug(response.statusCode + response.body);
          res.send({ token: -1 });
        }
      });
  },

  //create user role (trustee/investor)
  createUserRole: function (req, res, next) {
    logger.debug(req.body);
    var UserRoleID = uuidv4();
    logger.debug("UserRoleID::" + UserRoleID);
    var postData = {
      peers: req.body.peers,
      fcn: "CreateUserRole",
      args: [UserRoleID, req.body.UserRoleName]//'[\"'+userID+'\",\"'+req.body.args[0]+'\"]'
    };

    request.post({
      uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserRoleCC,
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.body.token
      },
      body: JSON.stringify(postData)
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          logger.debug(JSON.stringify(request));
          response = JSON.parse(body);
          res.send(response);
        } else {
          logger.debug(response.statusCode + response.body);

          res.send({ token: -1 });
        }
      });

  },
  getAllUserRoles: function (req, res, next) {
    logger.debug(req.query);

    var Token = "";
    var erro = 0;
    var count = 0;
    var erro2 = 0;
    var count2 = 0;
    var resvertical = "";


    var getAllRolesEmit = new EventEmitter();


    // -------------------------------------------- getting the token -----------------------------------------

    var getToken = {
      username: process.env.AdminUserName,
      orgName: process.env.TrusteeOrgName
    };

    console.log("gettoken::"+JSON.stringify(getToken));
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
          logger.debug("count is now" + count);
          getAllRolesEmit.emit('get');
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
    getAllRolesEmit.on('get', function () {


      var getData = {
        peer: process.env.TrusteePeer,
        fcn: "GetAllUserRoles",
        args: '[\"\"]'
      };

      request.get({
        uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserRoleCC + '?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + Token
        }
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            count2++;
            resvertical = response;
            // res.send(response);
          } else {
            logger.debug(response.statusCode + response.body);
            logger.debug("error occuered in charlesfortchannel ");
            //res.send({ token: -1 });
            erro2 == 1
            count2++;

          }
        });

    }); //end of event emiter


    function sayHello() {
      if (count2 == 1) {
        if (erro2 == 1) {
          res.status(400).send({ "message": "Missing Arguments!" });
        } else {
          logger.debug("final data response place");
          var finalJson = {
            "vertical": resvertical
          }
          res.send(finalJson);

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
  getUserRole: function (req, res, next) {
    logger.debug(req.query);

    var getData = {
      peer: req.query.peer,
      fcn: "GetUserRole",
      args: '[\"' + req.params.userRoleid + '\"]'
    };
    logger.debug("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortUserRoleCC + '?' + require('querystring').stringify(getData),
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
};

module.exports = distance;
