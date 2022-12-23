var request = require('request');
//const uuidv4 = require('uuid/v4');
const fabricURL = process.env.charlesFortfabricURL;
let nodemailer = require("nodemailer");
const EventEmitter = require('events');
var toLowerCase = require('to-lower-case');

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";


var promptstatus = {

    //query by month and dealid for the status=0/1 from bc 

    promptStatus: function (req, res, next) {

        //logger.debug(req.query);

        logger.debug(req.query.dealId);

        if (!req.query.dealId || !req.query.peer || !req.query.token || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {


            var month;
            var year;

            if (parseInt(req.query.month) == 1) {
                month = "12";
                year = String(parseInt(req.query.year) - 1);

            }
            else {
                month = String(parseInt(req.query.month) - 1);
                year = req.query.year;
            }

            var getData = {
                peer: req.query.peer,
                fcn: "GetHistoryOfInvestorReport",
                args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                //token: req.query.token
            };
            logger.debug("getDataaa++++++" + JSON.stringify(getData));
            request.get({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + req.query.token
                }

            },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.debug("length--------" + body.length + "     " + body);

                        if (body.length > 2) {

                            response = JSON.parse(body);
                            logger.debug("Length of audit trail:" + response.length);
                            if (response.length > 0) {

                                var json = { "status": "1", "length": String(response[0].length) };
                                res.send(json);
                            }
                            else {
                                var json = { "status": "0", "length": "0" };
                                res.send(json);
                            }
                        }

                        else {
                            var json = { "status": "0", "length": "0" };
                            res.send(json);
                        }

                    } else {
                        // logger.debug(response.statusCode + response.body);
                        res.send({ token: -1 });
                    }
                });
        }

    },

    enabledisable: function (req, res, next) {

        if (req.body.investorid.length == 0) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }

        else if (!req.body.peers || !req.body.token || !req.body.month || !req.body.year || !req.body.dealId ||
            !req.body.dates || !req.body.floating || !req.body.tests || !req.body.additionaldetails
            || !req.body.accounts || !req.body.fees || !req.body.waterfall || !req.body.newlogic )  {

            res.status(400).send({ "message": "Missing Arguments!" });
        }

        else {

            var dealId = toLowerCase(req.body.dealId);
            if (parseInt(req.body.month) == 1) {
                month = "12";
                year = String(parseInt(req.body.year) - 1);
            }
            else if (parseInt(req.body.month) == 2) {
                month = "1";
                year = req.body.year;
            }
            else {
                month = String(parseInt(req.body.month) - 1);
                year = req.body.year;
            }

                var g_arr = [];

                g_arr.push(req.body.isInitialAccrualPeriod);
                g_arr.push(req.body.dates.ispaymentdate);
                g_arr.push(req.body.dates.reportingdate);
                g_arr.push(req.body.floating.date);
                g_arr.push(req.body.investorid);
                g_arr.push(req.body.floating.rate);
                g_arr.push(req.body.accounts);
                g_arr.push(req.body.fees);
                g_arr.push(req.body.waterfall.holdbackamt);
                g_arr.push(req.body.additionaldetails.relationshipmanager);
                g_arr.push(req.body.additionaldetails.address);
                g_arr.push(req.body.additionaldetails.email);
                g_arr.push(req.body.additionaldetails.websitereporting);
                g_arr.push(req.body.reporttype);

                logger.debug("g_arr: " + JSON.stringify(g_arr));

                var getData = {
                    peer: req.body.peers[0],
                    fcn: "GetHistoryOfInputs",
                    args: '[\"' + toLowerCase(req.body.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                    //token: req.query.token
                };
                logger.debug("getDataaa++++++" + JSON.stringify(getData));
                request.get({
                    uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortGenerateInputsCC + '?' + require('querystring').stringify(getData),
                    headers: {
                        'content-type': 'application/json',
                        'authorization': 'Bearer ' + req.body.token
                    }

                },
                    function (error, response, body) {
                        if (!error && response.statusCode == 200) {

                            logger.debug("length--------" + body.length + "     " + body);
                            if (body.length > 2) {

                                response1 = JSON.parse(body);
                                response = JSON.parse(response1[response1.length - 1].GValue);

                                logger.debug("history of inv dummy :" + JSON.stringify(response) + "    " + response.length);

                                if (response.length == 0) {
                                    res.send({ "isSuccess": true });
                                }
                                else {
                                    compareloop(response, g_arr);
                                }
                            }
                            else {
                                res.send({ "isSuccess": true });
                            }

                        } else {
                            // logger.debug(response.statusCode + response.body);
                            res.send({ token: -1 });
                        }
                    });


            function compareloop(response, g_arr) {

                logger.debug("g array:   " + JSON.stringify(g_arr) + "\n");
                logger.debug("response of inputs:   " + JSON.stringify(response) + "\n");

                var disablecount = 0;

                for (var i = 0; i < g_arr.length; i++) {

                    var j1 = "Key " + (i + 1);

                    if (i == 4) {
                        g_arr[i] = String(g_arr[i]);
                        response[0][j1] = String(response[0][j1]);
                    }

                    if (g_arr[i] == response[0][j1]) {
                        logger.debug("inside if - match of inputs!!");
                        logger.debug("garr: " + g_arr[i] + "  response:  " + response[0][j1] + "  count:  " + disablecount);
                        disablecount++;
                    }
                    else {
                        logger.debug("inside Else - mismatch inputs!!");
                        logger.debug(g_arr[i] + "  " + response[0][j1] + "  " + disablecount);
                        disablecount = 0;
                        break;
                    }
                }
                if (disablecount == g_arr.length) {
                    res.sendStatus(204);
                }
                else if (disablecount == 0) {
                    res.send({ "isSuccess": true });
                }
            }
        } //end of else
    },



    getallversions: function (req, res, next) {


        logger.debug(req.query.dealId);

        if (!req.query.dealId || !req.query.peer || !req.query.token || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {


            var month;
            var year;

            if (parseInt(req.query.month) == 1) {
                month = "12";
                year = String(parseInt(req.query.year) - 1);

            }
            else {
                month = String(parseInt(req.query.month) - 1);
                year = req.query.year;
            }

            var getData = {
                peer: req.query.peer,
                fcn: "GetHistoryOfInvestorReport",
                args: '[\"' + toLowerCase(req.query.dealId) + '\",\"' + month + '\",\"' + year + '\"]'  //passing "dealId" as parameter in the API Call
                //token: req.query.token
            };
            logger.debug("getDataaa++++++" + JSON.stringify(getData));
            request.get({
                uri: fabricURL + '/channels/' + process.env.charlesFortChannelName + '/chaincodes/' + process.env.charlesfortInvestorReportAuditTrialCC + '?' + require('querystring').stringify(getData),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + req.query.token
                }

            },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        logger.debug("length--------" + body.length + "     " + body);

                        if (body.length > 2) {

                            response = JSON.parse(body);
                            logger.debug("Length of audit trail:" + response.length);
                            if (response.length > 0) {
                                forloopfun(response.length);
                            }
                            else {
                                res.sendStatus(204);
                            }
                        }

                        else {

                            res.sendStatus(204);
                        }

                    } else {
                        // logger.debug(response.statusCode + response.body);
                        res.send({ token: -1 });
                    }
                });
        }


        function forloopfun(length) {

            var arr1 = [];
            for (var i = 1; i <= length; i++) {


                if (i == length) {
                    var str = "Version " + String(i) + " - LATEST";
                }
                else {
                    var str = "Version " + String(i);
                }
                arr1.push(str);
            }
            logger.debug("arr1:  " + JSON.stringify(arr1));
            res.send(arr1);
        }

    }
}
module.exports = promptstatus;
