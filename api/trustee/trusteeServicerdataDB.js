var request = require('request');
//const uuidv4 = require('uuid/v4');
//const fabricURL = 'http://wsfs-node-internal-service.webclient.svc.cluster.local:80';
const fabricURL = process.env.charlesFortfabricURL;
// const fabricURL = 'https://charlesfort-internal.umbprod.intainabs.com';
const uuidv4 = require('uuid/v4');
const EventEmitter = require('events');
const xlsxFile = require('read-excel-file/node');
const fs = require('fs')
const csv = require('csvtojson');
var MongoClient = require('mongodb').MongoClient
var dateFormat = require('dateformat');
var contains = require("string-contains");
var toLowerCase = require('to-lower-case');

// var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";
var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";
// var url = "mongodb://localhost:27017/UMB";
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

var servicerdata3 = {

  getdetailsfromdb: function (req, res, next) {
    var eventemit4 = new EventEmitter();

    var dealId = toLowerCase(req.query.dealId);
    var month = req.query.month;
    var year = req.query.year;

    //check for the args
    if (!req.query.dealId || !req.query.month || !req.query.year) {
      res.status(400).send({ "message": "Missing Arguments!" });
    }
    else {

      var count = 0;
      var prinbal = 0.00;
      var interestcol = 0.00;
      var principalcol = 0.00;
      var arr = [];

      //query from mongo for the dealid,month,year
      MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        const db = client.db("UMB");
        logger.debug('CONNECTED');
        logger.debug('CONNECTED2');

        db.collection('Loan_Tape_CharlesFort').find({ DealID: dealId, Month: month, Year: year }).toArray(function (err, result) {
          logger.debug("Lengthof result" + result.length);
          if (result.length > 0) {

            console.log("res::" + JSON.stringify(result));
            for (var i = 0; i < result.length; ++i) {
              var json = result[i];
              prinbal = parseFloat(parseFloat(prinbal) + parseFloat(json.PrincipalBalance));
            }
            var json = {
              "key": "Number of Assets",
              "value": result.length
            }

            arr.push(json);

            var json = {
              "key": "Principal Balance",
              "value": prinbal
            }
            arr.push(json);

            if (req.query.month == 6 && req.query.year == 2022) {
              var json = {
                "key": "Interest Collected",
                "value": "7390.57"
              }
              arr.push(json);

              var json = {
                "key": "Principal Collected",
                "value": "16391.31"
              }
              arr.push(json);

              var json = {
                "key": "Expense Collected",
                "value": "144.61"
              }
              arr.push(json);
            } else if (req.query.month == 7 && req.query.year == 2022) {
              var json = {
                "key": "Interest Collected",
                "value": "8162.22"
              }
              arr.push(json);

              var json = {
                "key": "Principal Collected",
                "value": "16604.26"
              }
              arr.push(json);

              var json = {
                "key": "Expense Collected",
                "value": "0.00"
              }
              arr.push(json);
            } else if (req.query.month == 8 && req.query.year == 2022) {
              var json = {
                "key": "Interest Collected",
                "value": "9052.77777777778"
              }
              arr.push(json);

              var json = {
                "key": "Principal Collected",
                "value": "11279004.8528071"
              }
              arr.push(json);

              var json = {
                "key": "Expense Collected",
                "value": "0.00"
              }
              arr.push(json);
            }  else if (req.query.month == 9 && req.query.year == 2022) {
              var json = {
                "key": "Interest Collected",
                "value": "0.00"
              }
              arr.push(json);

              var json = {
                "key": "Principal Collected",
                "value": "0.00"
              }
              arr.push(json);

              var json = {
                "key": "Expense Collected",
                "value": "0.00"
              }
              arr.push(json);
            }

            res.send(arr);
          }
          else {
            logger.debug("No data found!")
            ress.sendStatus(204);
          }
        })

      })
    }

  },

  servicerdata: function (req, res, next) {
    logger.debug("\n API HIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");
    var saveToBC = new EventEmitter();
    var saveToBC2 = new EventEmitter();

    var dealId = req.body.dealId;
    var month = req.body.month;
    var year = req.body.year;


    // var peerString = req.body.peers[0];
    // logger.debug("peerString::" + peerString);
    // var peerArr = peerString;//.split(",");


    var dealId = req.body.dealId;
    logger.debug(dealId);
    if (parseInt(req.body.month) < 10) {
      var month = "0" + req.body.month;
    }
    else {
      var month = req.body.month;
    }
    logger.debug("month>>>>" + month + " " + req.body.month);
    var year = req.body.year;
    logger.debug(year);
    var filetype = req.body.filetype;
    logger.debug(filetype);
    // var filePath = __dirname + '/uploads/'+ dealId + "-" + month + "-" + year + ".xlsx";
    // logger.debug(filePath);

    var filename = dealId + "-" + month + "-" + year + filetype;
    logger.debug(filename);

    var uploadname = "./uploads/" + filename;
    logger.debug("uploadnameee" + uploadname);
    logger.debug("tobegiveninfunc" + uploadname);

    const path = uploadname;
    logger.debug("pathhhhh" + path);

    // check for the args 
    if (!req.body.dealId || !req.body.month || !req.body.year || !req.body.updatedBy) {
      res.status(400).send({ "message": "Missing Arguments!" })
    }
    else {

      var LT = [];
      console.debug("before :" + new Date());
      var month = parseInt(req.body.month);
      // check for the filetype
      if (filetype == ".xlsx" || filetype == ".xls") {

        logger.debug("inside ------------------------------xl")
        var dealId = toLowerCase(req.body.dealId);
        var flag = 0;
        var flag2 = 0;

        if (fs.existsSync(path)) {
          logger.debug("inside ------------------------------xl")
          logger.debug("File exist!");

          xlsxFile(uploadname, { sheet: 'Tape_Enhanced' }).then((loanTape, err) => {
            // xlsxFile(uploadname).then((loanTape, err) => {
            console.log("inside xlsx");
            // check for the details already present in db,else insert it to db
            MongoClient.connect(url, function (err, client) {
              const db = client.db("UMB");
              console.log("inside mongo");
              logger.debug("Database----" + db);

              console.log("t::" + String(dealId));
              console.log("Y::" + String(month));
              console.log("T::" + String(year));
              //db.collection('Loan_Tape_Vertical').find({ DealID: dealId, Month: month, Year: year }).toArray(function (err, result) {
              db.collection('Loan_Tape_CharlesFort').remove({ DealID: dealId, Month: month, Year: year }, function (err, result) {
                if (err) throw err;
                logger.debug("loan Data tape" + JSON.stringify(result));
                logger.debug("length" + result.length)
                // if (result.length > 0) {
                //   var result =
                //   {
                //     "success": false,
                //     "result": "Data already exist"
                //   }
                //   res.send(result);
                //   console.debug("-----------------loan tape data exist --------------------");
                // }
                // else {
                  console.debug("After : " + new Date());
                  var seq = 0;
                  console.log(loanTape.length);
                  for (lt = 1; lt < loanTape.length; lt++) {
                    //json to be changed

                    //date condition
                    // console.log("11:: " + String(loanTape[lt][11]));
                    // console.log("48:: " + String(loanTape[lt][49]));
                    if (String(loanTape[lt][11]) != null) {
                      var date4 = dateFormat(loanTape[lt][11], "dd/mm/yyyy");
                      date4 = date4.split("/");
                      var sd = date4[0] + "-" + date4[1] + "-" + date4[2];
                      loanTape[lt][11] = sd;
                    } else {
                      loanTape[lt][11] = "";
                    }

                    if (String(loanTape[lt][49]) != "null") {
                      var date4 = dateFormat(loanTape[lt][49], "dd/mm/yyyy");
                      date4 = date4.split("/");
                      console.log(date4);
                      var sd = date4[0] + "-" + date4[1] + "-" + date4[2];
                      loanTape[lt][49] = sd;
                    } else {
                      loanTape[lt][49] = "";
                    }

                    if (String(loanTape[lt][51]) != "null") {
                      var date5 = dateFormat(loanTape[lt][51], "dd/mm/yyyy");
                      date5 = date5.split("/");
                      console.log(date5);
                      var sd1 = date5[0] + "-" + date5[1] + "-" + date5[2];
                      loanTape[lt][51] = sd1;
                    } else {
                      loanTape[lt][51] = "";
                    }
                    if(String(loanTape[lt][12])!= "null")
                    {

                    }
                    else{
                      loanTape[lt][12] = "";
                    }

                    if(String(loanTape[lt][13])!= "null")
                    {

                    }else{
                      loanTape[lt][13] = "";
                    }
                    if(String(loanTape[lt][14])!= "null")
                    {

                    }else{
                      loanTape[lt][14] = "";
                    }                    
                    if(String(loanTape[lt][15])!= "null")
                    {}else{
                      loanTape[lt][15] = "";
                    }     
                    if(String(loanTape[lt][23])!= "null")
                    {}else{
                      loanTape[lt][23] = "";
                    }                                     
                    if(String(loanTape[lt][26])!= "null")
                    {}else{
                      loanTape[lt][26] = "";
                    } 
                    if(String(loanTape[lt][27])!= "null")
                    {}else{
                      loanTape[lt][27] = "";
                    }                     
                    if(String(loanTape[lt][28])!= "null")
                    {}else{
                      loanTape[lt][28] = "";
                    }        
                    if(String(loanTape[lt][41])!= "null")
                    {}else{
                      loanTape[lt][41] = "";
                    }     
                    if(String(loanTape[lt][3])!= "null")
                    {}else{
                      loanTape[lt][3] = "";
                    }    
                    if(String(loanTape[lt][4])!= "null")
                    {}else{
                      loanTape[lt][4] = "";
                    }
                    if(String(loanTape[lt][6])!= "null")
                    {}else{
                      loanTape[lt][6] = "";
                    }  
                    if(String(loanTape[lt][7])!= "null")
                    {}else{
                      loanTape[lt][7] = "";
                    }    
                    if(String(loanTape[lt][9])!= "null")
                    {}else{
                      loanTape[lt][9] = "";
                    }    
                    if(String(loanTape[lt][10])!= "null")
                    {}else{
                      loanTape[lt][10] = "";
                    }                                                                                  
                    if(String(loanTape[lt][16])!= "null")
                    {}else{
                      loanTape[lt][16] = "";
                    }  
                    if(String(loanTape[lt][17])!= "null")
                    {}else{
                      loanTape[lt][17] = "";
                    }  
                    if(String(loanTape[lt][20])!= "null")
                    {}else{
                      loanTape[lt][20] = "";
                    } 
                    if(String(loanTape[lt][22])!= "null")
                    {}else{
                      loanTape[lt][22] = "";
                    }     
                    if(String(loanTape[lt][24]) != "null")
                    {}else{
                      loanTape[lt][24] = "";
                    }    
                    if(String(loanTape[lt][46])!= "null")
                    {}else{
                      loanTape[lt][46] = "";
                    }  
                    if(String(loanTape[lt][47])!= "null")
                    {}else{
                      loanTape[lt][47] = "";
                    }        
                    if(String(loanTape[lt][50])!= "null")
                    {}else{
                      loanTape[lt][50] = "";
                    }     
                    if(String(loanTape[lt][35])!= "null")
                    {}else{
                      loanTape[lt][35] = "";
                    } 
                    if(String(loanTape[lt][42])!= "null")
                    {}else{
                      loanTape[lt][42] = "";
                    }   
                    if(String(loanTape[lt][48])!= "null")
                    {}else{
                      loanTape[lt][48] = "";
                    }                                                                                                                 
                                                      
                    console.log(loanTape[lt][0]);
                    seq = seq + 1;
                    var ltJson = {
                      "DataID": String(uuidv4()),
                      "UpdatedBy": String(req.body.updatedBy),
                      "DealID": String(dealId),
                      "Month": String(month),
                      "Year": String(year),
                      "MovedToBlockchain": "true",
                      "SeqNo": String(seq),
                      "Cusip": String(loanTape[lt][0]),
                      "SecurityName": String(loanTape[lt][1]),
                      "PrincipalBalance": String(loanTape[lt][2]),
                      "MoodysRating": String(loanTape[lt][3]),
                      "MoodysRatingSource": String(loanTape[lt][4]),
                      "EstimatedAverageLife": String(loanTape[lt][5]),
                      "SecurityType": String(loanTape[lt][6]),
                      "CreditOpinion": String(loanTape[lt][7]),
                      "Spread": String(loanTape[lt][8]),
                      "SPRatingSource": String(loanTape[lt][9]),
                      "SPRating": String(loanTape[lt][10]),
                      "Maturity": String(loanTape[lt][11]),
                      "FitchRatingSource": String(loanTape[lt][12]),
                      "FitchRating": String(loanTape[lt][13]),
                      "GlobalFitchRating": String(loanTape[lt][14]),
                      "InterestCollection": String(loanTape[lt][15]),
                      "Days": String(loanTape[lt][16]),
                      "IndexType": String(loanTape[lt][17]),
                      "Spread": String(loanTape[lt][18]),
                      "InterestRate": String(loanTape[lt][19]),
                      "CouponType": String(loanTape[lt][20]),
                      "PaymentFrequency": String(loanTape[lt][21]),
                      "Currency": String(loanTape[lt][22]),
                      "PrincipalCollection": String(loanTape[lt][23]),
                      "ServicerName": String(loanTape[lt][24]),
                      "IsDefaulted": String(loanTape[lt][25]),
                      "DerivedMoodysRating": String(loanTape[lt][26]),
                      "SPIssuerRating": String(loanTape[lt][27]),
                      "DerivedSPRating": String(loanTape[lt][28]),
                      "DerivedFitchRating": String(loanTape[lt][29]),
                      "MCORatingidx": String(loanTape[lt][30]),
                      "SPRatingidx": String(loanTape[lt][31]),
                      "MCOhaircut": String(loanTape[lt][32]),
                      "SPhaircut": String(loanTape[lt][33]),
                      "warf": String(loanTape[lt][34]),
                      "SPIssuanceRating": String(loanTape[lt][35]),
                      "SPidx": String(loanTape[lt][36]),
                      "MCOrec": String(loanTape[lt][37]),
                      "SPrec": String(loanTape[lt][38]),
                      "Marketvalue": String(loanTape[lt][39]),
                      "Calculatedamount": String(loanTape[lt][40]),
                      "ServicerRatingMoodys": String(loanTape[lt][41]),
                      "ServicerRatingSP": String(loanTape[lt][42]),
                      "ServicerRatingMoodys1": String(loanTape[lt][43]),
                      "ServicerRatingSP1": String(loanTape[lt][44]),
                      "IsPIK": String(loanTape[lt][45]),
                      "SpecifiedType": String(loanTape[lt][46]),
                      "Negamissued": String(loanTape[lt][47]),
                      "SPIssuanceRating1": String(loanTape[lt][48]),
                      "IssuerDate": String(loanTape[lt][49]),
                      "InvestmentType": String(loanTape[lt][50]),
                      "SalesDate" : String(loanTape[lt][51]),
                      "SalesReceipts" : String(loanTape[lt][52])
                    };
                    LT.push(ltJson);

                    if (lt == 1) {
                        console.log(ltJson);
                    }

                    if (lt + 1 == loanTape.length) {
                      db.collection('Loan_Tape_CharlesFort').insert(LT, (err, loantapeSave) => {
                          if (err) return logger.debug(err)
                          logger.debug('saved to database')
                          var result =
                          {
                              "success": true,
                              "result": "Data Saved"
                          }
                          res.send(result);

                      })
                    }//end of if

                  }//end of for
                // }//end of else
              }) // db
            })//end of xlsx

          })//mongo
        }
      }
    }
  }
};

module.exports = servicerdata3;
