var express = require('express');
var app = express();
var request = require('request');
const fabricURL = process.env.charlesFortfabricURL;
var request = require('request');
const uuidv4 = require('uuid/v4');
var EventEmitter = require('events').EventEmitter;
var cors = require('cors')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var path = require("path");
var fs = require('fs');
var multer = require('multer');
var toLowerCase = require('to-lower-case');
var timeout = require('connect-timeout');
var ejs = require("ejs");
var pdf = require("html-pdf");
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

 var jsonParser = bodyParser.json({limit:1024*1024*20, type:'application/json'});
// var urlencodedParser = bodyParser.urlencoded({ extended:true,limit:1024*1024*20,type:'application/x-www-form-urlencoded' })
// app.use(express.json({limit: '1000mb'}));

app.use(bodyParser.json({
  limit: '1000mb'
}));

app.use(bodyParser.urlencoded({
  limit: '1000mb',
  parameterLimit: 1000000000,
  extended: true 
}));

app.use(timeout(2000000000)); //10min and plus

//app.use(bodyParser);
app.use(jsonParser);
app.use(cors());
//app.use(urlencodedParser);

var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";
//var url = "mongodb://" + process.env.MongoUserName + ":" + encodeURIComponent(process.env.MongoPassword) + process.env.MongoURL + "?authMechanism=SCRAM-SHA-1";


//------------------- upload file in uploads folder ----------------
var filenamearr = [];

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('filename');

//-----------------------------upload file in loantapeuploads folder-------------------------------------------

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'loantapeuploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload1 = multer({ storage: storage }).single('files');
//end of file upload--------------------------------------------------


//-----------------------------------TRUSTEE MODULE--------------------------------------------------

//----------------------------Routes for Trustee Module---------------------------------------------
var trusteeInitialSetup_route = require('./api/trustee/trusteeInitialSetup');
var trusteeServicerDataBC_route = require('./api/trustee/trusteeServicerDataBC');
var trusteeInvestorReport_route = require('./api/trustee/trusteeInvestorReport');
var trusteeReportStatus_route = require('./api/trustee/trusteeReportstatus');
var trusteePublish_route = require('./api/trustee/trusteeReportstatus');
var trusteeServicerDataDB_route3 = require('./api/trustee/trusteeServicerdataDB');
var trusteeServicerUI_route = require('./api/trustee/ui_update_bc');
var trusteeServicerDataBCUI_route = require('./api/trustee/ui_save_bc');
var getAllInvRoutes = require('./api/trustee/getallinvestors');
var chaincodeRoutes = require('./api/trustee/chaincode');
var audittrail_route = require('./api/trustee/audittrail.js')
var trusteeOnlineReporting_route = require('./api/trustee/trusteeOnlineReporting.js');

// ----------------------------------------Loan Data Tape--------------------------------------------------------------------------------
// var loantape_cal_route = require('./api/loandatatape/calculations');
// var loantape_groupby_route = require('./api/loandatatape/groupbymethod');


// ---------------------------------------User Authentication Module----------------------------------------------------

// --------------------------------------Routes for user authentication module -----------------------------------------

var UA_route = require('./api/authentication/userLogin');
var UAR_route = require('./api/authentication/userRole');
var UAT_route = require('./api/authentication/trusteeUser');




// --------------------------------------TRUSTEE MODULE APIs------------------------------------------------ 

//INITIAL SETUP
// 1st tab
app.post('/api/v1/trustee/initialsetupCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = trusteeInitialSetup_route.saveinitialsetup(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/api/v1/trustee/initialsetupQueryCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = trusteeInitialSetup_route.queryinitialsetup(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});


app.get('/api/v1/trustee/getalldeals', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = trusteeInitialSetup_route.queryalldeals(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});


//---------
//Upload the Excel to uploads folder :
// 2nd tab (1st api)
app.post('/api/v1/trustee/uploadservicerreportCharlesfort', function (req, res) {
  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      logger.debug("Directory Does Not exist!");
      logger.debug("Directory Does Not exist22!");
      logger.debug("Directory Does Not exist3!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        var uploadpath = __dirname +'/uploads/' + req.file.filename;
        //filenamearr.push(uploadpath);
        logger.debug(uploadpath);

        var ext = path.extname(req.file.originalname);
        logger.debug("extension :::"+ext);

        var output = {isSuccess:true,filetype:ext.toString(),result:"Document uploaded successfully!"};
        res.send(output);
      });
    }
  })
});

//Read the Excel Uploaded and Save the Servicer Data Details To Mongodb :

app.post('/api/v1/trustee/servicerdataCharlesfort',jsonParser, function (req, res) {
  // logger.debug("uploadfilename"+upload.filename)
  // var recursivecount = 0;
  // var a = [];
  let response = trusteeServicerDataDB_route3.servicerdata(req, res,function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});


//Get Data From DB : MongoDB
// 3rd tab
app.get('/api/v1/trustee/servicerdataCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query.dealId);
  logger.debug(req.query.month);
  logger.debug(req.query.year);

  // logger.debug("dealId" + dealId);
  let response = trusteeServicerDataDB_route3.getdetailsfromdb(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});


// Save Servicer Data In BlockChain
app.post('/api/v1/trustee/onboardservicerdataCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = trusteeServicerDataBCUI_route.saveblockchainui(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

// View Servicer Report by passing Month and year
//5th tab
app.get('/api/v1/trustee/onchainservicerdataCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = trusteeServicerDataBCUI_route.getServicerData(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

// TRUSTEE--------------Investor Report apis part---------------------------------------------
//6th tab
//generate investor report

app.get('/api/v1/trustee/getallinvestorsCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = getAllInvRoutes.getallinvestors(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/api/v1/trustee/getadjustmentmonthCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = getAllInvRoutes.getadjustmentmonth(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

//--------------------------------- audit trail --------------------------------------------------------


app.get('/api/v1/trustee/prompt', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = audittrail_route.promptStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.post('/api/v1/trustee/enabledisable', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = audittrail_route.enabledisable(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});


app.post('/api/v1/trustee/chaincodeCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = chaincodeRoutes.chaincodereport(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

//------------------------------------------------------------------------------------------------

// View Investor Report 

app.get('/api/v1/trustee/reportCharlesfort', jsonParser, function (req, res) {
  // logger.debug("req::"+JSON.stringify(req));
  logger.debug(req.query);

  let response = trusteeInvestorReport_route.getInvestorReport(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


//SaveDealPublishCC
// 6th tab (publish)
app.post('/api/v1/trustee/publishCharlesfort', jsonParser, function (req, res) {
  logger.debug("api hit");
  logger.debug(req.body.DealID);
  logger.debug(req.body.Status);
  let response = trusteePublish_route.savepublishdetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

//QueryByReportStatus : DealPublishCC
// 6th tab (publish(get status))
app.get('/api/v1/trustee/reportstatusCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query.DealID);

  var dealId = req.query.DealID;
  logger.debug("dealId" + dealId);
  let response = trusteeReportStatus_route.gettrusteereportstatusbyid(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.get('/api/v1/trustee/reportstatusCharlesfortStrat', jsonParser, function (req, res) {
  logger.debug(req.query.DealID);

  var dealId = req.query.DealID;
  logger.debug("dealId" + dealId);
  let response = trusteeReportStatus_route.gettrusteereportstatusLoanStratbyid(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

//---------------------------------------------Customized api new -------------------------------------------------------------

app.get('/api/v1/trustee/invreporthistoryCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query.DealID);

  var dealId = req.query.DealID;
  let response = trusteeOnlineReporting_route.getinvhistory(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.get('/api/v1/trustee/invreportresponseCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query.DealID);

  var dealId = req.query.DealID;
  let response = trusteeOnlineReporting_route.getinvreportresponse(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.post('/api/v1/trustee/savecustomreportCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.body.DealID);

  let response = trusteeOnlineReporting_route.savecustomreport(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});


app.get('/api/v1/trustee/viewcustomreportCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query.dealId);

  let response = trusteeOnlineReporting_route.viewcustomreport(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.get('/api/v1/trustee/viewinvestorreportCharlesfort', jsonParser, function (req, res) {
  logger.debug(req.query.DealID);

  let response = trusteeOnlineReporting_route.viewinvestorreport(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});


//------------------------------------------------Loan Data Tape----------------------------------------------

app.post('/savedictionaryCharlesfort', function (req, res) {

  var dealId = toLowerCase(req.body.dealId);

  if(parseInt(req.body.month) == 1){
    var month = "12";
    var year = String(parseInt(req.body.year)-1);  
 }
 else{
    var month = String(parseInt(req.body.month)-1);
    var year = req.body.year;
  
 }
  // var month = req.body.month;
  // var year = req.body.year;
  var arr = req.body.tableData;
  logger.debug("dealId::" + dealId);
  logger.debug("month::" + month);
  logger.debug("year::" + year);
  logger.debug("tabledata::" + JSON.stringify(arr));

  MongoClient.connect(url, function (err, client) {
    if(err)throw err;
    const db = client.db("UMB");

    db.collection('LoandictionaryUMB').find({ DealId: dealId, Month: month, Year: year }).toArray(function (err, result) {
      logger.debug("result::" + result.length);
      if (result.length > 0) {
        res.sendStatus(204);
      } else {
        var json = {
          "DealId": String(dealId),
          'Month': String(month),
          "Year": String(year),
          "TableData": String(JSON.stringify(arr))
        }
        logger.debug("connected");
        db.collection('LoandictionaryUMB').insertOne(json, function (err, result) {
          // if (err) throw err;
          logger.debug("1 document inserted");

        });

        db.collection('LoandictionaryUMB').find({ DealId: toLowerCase(dealId), Month: month, Year: year }).toArray(function (err, result) {
          logger.debug("result::" + result.length);
          if (result.length > 0) {
            res.send({ "isSuccess": true, "message": "Data Saved!" });
          } else {
            res.send({ "isSuccess": false, "message": "Data Not Saved!" });
          }
        });
      }

    });
    });
  });


// ------------------------------------------------User Authentication -----------------------------------------------------------

//USER LOGIN

app.post('/login', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = UA_route.login(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.post('/authenticate', jsonParser, function (req, res) {
  logger.debug(req.query);
  console.log("inside api");
  let response = UA_route.authenticate(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/addUser', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = UA_route.addUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.post('/addApprovedUserDetails', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = UA_route.addApprovedUserDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.post('/addRegisteredUser', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = UA_route.addRegisteredUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});



app.get('/getUser/:userId', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UA_route.getUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//getUserByOrgName

app.get('/getUserByOrgName/:OrgName', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UA_route.getUserByOrgName(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getAllUsers', jsonParser, function (req, res) {
  logger.debug(req.query);
  let response = UA_route.getAllUsers(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserByUsername/:userName', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UA_route.getUserByUsername(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/approveUser', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UA_route.approveUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});



app.post('/addTrusteeUser', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = UAT_route.addTrusteeUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.post('/approveTrusteeUser', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UAT_route.approveTrusteeUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//

app.post('/addApprovedTrusteeUserDetails', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = UAT_route.addApprovedTrusteeUserDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});


app.post('/allocateUserRole', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UA_route.allocateUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserByEmailID/:emailId', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UA_route.getUserByEmailID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserByUserRoleName/:userRoleName', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UA_route.getUserByUserRoleName(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});



// USER ROLE

app.post('/createUserRole', jsonParser, function (req, res) {
  logger.debug(req.body);
  let response = UAR_route.createUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/getAllUserRoles', jsonParser, function (req, res) {
  logger.debug(req.query);
  console.log("inside api");
  let response = UAR_route.getAllUserRoles(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserRole/:userRoleid', jsonParser, function (req, res) {
  logger.debug(req.query);

  let response = UAR_route.getUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


//--------------------------------------------------

app.post("/invreportpdf", (req, res) => {

  const data = JSON.parse(req.body.data);
  const newStyle = `<style>

  .wrapper-pdf-container  *
  .wrapper-pdf-container::after,
  .wrapper-pdf-container::before { box-sizing: border-box; }
  .wrapper-pdf-container label{ margin: 0px;}
  .wrapper-pdf-container {font-family: "Segoe UI"; font-size: 12px;background: #fff; margin: 0px -12px;}
  .wrapper-pdf-container *{font-family: "Segoe UI";}
  .wrapper-pdf{ margin: auto; max-width: 1440px; padding: 0px 31px 25px 31px; font-size: 12px; scroll-margin-top: 70px;}
  .wrapper-pdf-container .page-first{ background: #fff url(https://in-d.ai/wp-content/uploads/2020/11/ReportImage.jpg) 100% 45px no-repeat; height:731px; padding-bottom: -10mm; color: #fff}
  .wrapper-pdf-container table.table.table-bordered + table.table.table-bordered{ margin-top:-15px}

  .wrapper-pdf-container .page-first{  
    background-image: url(https://in-d.ai/wp-content/uploads/2020/11/ReportImage.jpg);
    background-repeat: no-repeat;
  background-size: contain;
  padding-bottom: 0px;
   background-position: right;
   background-position-y: 20px;
   background-size: 550px 500px;

}
#wsfs_logo_first
{
  background-repeat: no-repeat;
    background-size: contain;
    padding-bottom: 0px;
    background-position: right;
    // width: 100%;
    //height: 37px;
}
#wsfs_logo {
  background-repeat: no-repeat;
  background-size: contain;
  padding-bottom: 0px;
  background-position: right;
  // width: 100%;
  //height: 30px;
}
  .wrapper-pdf-container .page-first *{ color: black;}
  .wrapper-pdf-container .page-first h1.pagetitle{ color: #1C487A;}
  .wrapper-pdf-container h1.pagetitle{ font-size: 26px; position: relative; padding-bottom: 10px; margin-bottom: 50px;}
  .wrapper-pdf-container h1.pagetitle::before{ border-bottom: 2px solid #1C487A; width: 100px; content: ""; bottom: 0px; left: 0px; height: 2px; position: absolute;}
  .wrapper-pdf-container .page-first label{ color: #414141; font-size: 12px; display: block; padding: 10px 0px; }
  .wrapper-pdf-container .page-first table{ width: 100%; color: #fff;}
 // .wrapper-pdf-container .page-first .investor_title{ background: #25b654; color: #fff; font-size: 23px; padding:10px 15px; display: inline-block; margin: 70px 0px;}
    .wrapper-pdf-container .page-first .investor_title{ background: #1C487A; color: #fff; font-size: 23px; padding:10px 15px; display: inline-block; margin: 70px 0px;}
  .wrapper-pdf-container .page-first h3{ font-weight: 100; font-size: 16px; color: #1C487A;}
  .wrapper-pdf-container .page-first .divider{ height: 25px;}
  .wrapper-pdf-container .page-first .usernote,
  .wrapper-pdf-container .page-first .footernote{ margin: 100px 60px 0px -47px;width:108.5%}
  .wrapper-pdf-container .page-first .footertext { font-size: 9px !important; color: black; font-weight: 100; text-align: center; line-height: 18px;}
  .index{ background: #fff; padding-bottom: 50px;}
  .index ul { counter-reset: my-awesome-counter; list-style: none;  margin: 0px; padding: 0px;}
  .index ul li{ display: inline-block; padding: 25px 20px 0px 15px;  width: 20%; color: #0f0f0f; font-size: 12px; counter-increment: my-awesome-counter; position: relative;}
  .index ul li .inner{background: #fff;  height :50px; box-shadow: 0px 5px 5px #ccc; padding: 70px 10px 20px 15px; font-weight: 500;font-size:10px !important}
  .index ul li::before { content: counter(my-awesome-counter);  color: #414141; font-weight: normal; position: absolute; left: 30px; top: 60px; }
  .index ul li::after{ border-bottom: 4px solid #1C487A; width: 75px; content: ""; top: 50px; left: 30px; height: 2px; position: absolute;}
  .index ul li a{ color: #414141; text-decoration: none;}
  #value0 {color:#1C487A !important;font-weight: bolder !important;}

  h4.sectiontitle{ color: #1C487A; font-weight: bold; position: relative; font-size: 16px; padding-bottom: 10px; margin-bottom: 30px;}
  h5.sectiontitle {
    color:#1C487A;
    font-weight: bold;
    position: absolute;
    font-size: 14px;
    padding-bottom: 10px;
    margin-bottom: 30px;
    text-align: right;
    right: 50px;
    margin-top: -59px;
}
h5.sectiontitle_collateral {

  color:#0d6838;
  font-weight: bold;
  position: absolute;
  font-size: 14px;
  padding-bottom: 10px;
  margin-bottom: 30px;
  text-align: right;
  right: 80px;
  margin-top: -59px;

}
#NoLoanDisplay {
  text-align: center;
}

td.total,
td.total ~ td {  background: #D9f2ff !important;
  font-weight: bold;}
 
   td.subtotal,
td.subtotal ~ td {  
  font-weight: bold;}
 
  h4.sectiontitle::before{ border-bottom: 2px solid #1C487A; width: 100px; content: ""; bottom: 0px; left: 0px; height: 2px; position: absolute;}

  .summery{ padding: 25px; background: #fff; box-shadow: 0px 0px 10px #ccc; margin-bottom: 8px;}
  .summery .table{ border: none!important;}
  .summery .table td{ border-top: 0px; border-right: 1px solid #ccc; color: #404040;}
  .summery .table td:last-child{ border: none;}
  .summery .table td strong{ font-weight: bold; font-size: 12px; display: block; padding-top: 10px;}
  .wrapper-pdf-total{ margin: auto; max-width: 1440px; padding: 0px 50px 0px 50px !important; font-size: 12px; scroll-margin-top: 70px;}

  .total-payment-summmery{background: #23b354 url(https://in-d.ai/wp-content/uploads/2020/10/pdf-2.png) 99% 100% no-repeat; padding-top: 30px;}
  h4.subsectiontitle{ color: #fff; font-weight: 300; position: relative; font-size: 16px; padding-bottom: 10px; margin-bottom: 0px;}

  .total-payment-summmery ul { list-style: none; margin: 0px; padding: 0px; }
  .total-payment-summmery ul li{ display: inline-block; padding: 10px 10px 0px 0px;  width: 33%; color: #0f0f0f; font-size: 16px; position: relative;}
  .total-payment-summmery ul li p{ font-size: 14px; font-weight: normal;}
  .total-payment-summmery ul li .inner{background: #fff; box-shadow: 0px 0px 15px #046424; padding: 25px 15px 25px 15px; font-weight: 500;}
  .wrapper-pdf-container table.table.table-bordered{ box-shadow: 0px 0px 15px #b2b2b2; color: #252525; }
  .wrapper-pdf-container table.table.table-bordered thead,
  .wrapper-pdf-container table.table.table-bordered .thead-light th { background-color: #1C487A !important; color: #fff !important;font-size:11px !important}
  .wrapper-pdf-container table.table.table-bordered strong{ font-weight: 500;}
  .wrapper-pdf-container .marginTop{ margin-top: 25px;}
  .wrapper-pdf-container table.table.table-bordered .total_tr td{ background:#d4fce7; font-weight: bold;}
  .wrapper-pdf-container table.table.table-bordered  td{ background:#fff; }
  .wrapper-pdf-container .dealcontactinfo a{color: black;}
  .wrapper-pdf-container .table td,
  .wrapper-pdf-container .table th { padding: 6px; vertical-align: top; font-size:10px !important }
  .wrapper-pdf-container .table-bordered td,
  .wrapper-pdf-container .table-bordered th { border: 1px solid #dee2e6; }
  .wrapper-pdf-container .table-bordered { border: 1px solid #dee2e6; }
  .wrapper-pdf-container .table { width: 100%; max-width: 100%; margin-bottom: 1rem; background-color: transparent;}
  .wrapper-pdf-container  table { border-collapse: collapse; text-align: left; width: 100%;  vertical-align: top;}
  .wrapper-pdf-container  table td{ text-align: left; vertical-align: top;font-size:13px !important}
  .wrapper-pdf-container  table th{ text-align: center; vertical-align: top;font-size:13px !important}
  .wrapper-pdf-container .w50 { padding-right: 30px; width: 50%;}
  .beforeClass{page-break-after:always; }
  #payment-summary{padding-top: 0px;}
  #principal-payments{padding-top: 20px;}
  #current-period-modification-details{padding-bottom: 320px;}
  .notes_footer{background:#black}
  .wrapper-pdf-container .lastnotes{
    background: #black !important;
    height:100px;
  }

  .wrapper-pdf-container table.table.table-bordered strong{font-weight: bolder !important}
  #pageHeader-first{ height: 60px; background: #fff; margin:-10px -15px 0px -15px; padding: 26px;}
  #pageHeader{background: #fff;  padding: 0px 0px 20px 0px; width: 100%; height: 40px;margin: -10px -20px 0px -10px }
  #pageHeader .page-header-bottom{ background: #f8f8f8;height:40px ;padding :10px 10px 10px 10px ;width:100% }
  #pageHeader .page-header-right{ margin-top: 5px;}  
  .page-header-right { float: right;}
  .page-header-right .logo{ float: left; padding-left: 25px;}
  .page-header-right .home{ float: left;padding-left: 25px;}
  .page-header-right .menu{ float: left;padding-left: 25px; padding-top: 5px;}
  .page-header-right .up{ float: left;padding-left: 25px;}
  .page-header-right .down{ float: left;padding-left: 25px;}
  .page-header-left{ float: left;}
  .page-header-left .header-title{ float: left; color: #1C487A; font-size: 14px; padding: 15px 0px;font-weight:bolder !important}
  .page-header-left .header-distribution-date{ font-size:12px !important;float: left; padding: 0px 25px; color: black; border-left: 2px solid #1C487A; border-right: 2px solid #1C487A; margin-left: 25px;}
  .page-header-left .header-report-type{ font-size:12px !important; float: left;; padding: 0px 25px; color: black;}
  .page-header-left label{ color: #414141; display: block; margin: 0px; padding: 0px 0px 10px 0px; font-size: 14px;}
// saluda2 new
#PerformanceDetails{ margin-bottom: 30px;}
#PerformanceDetails table tr td{ width: 20%;}
#PerformanceDetails1 table tr td{ width: 20%;}
#PerformanceDetails2 table tr td,
#PerformanceDetails3 table tr td,
#PerformanceDetails4 table tr td,
#PerformanceDetails5 table tr td,
#PerformanceDetails2 table tr th,
#PerformanceDetails3 table tr th,
#PerformanceDetails4 table tr th ,
#PerformanceDetails5 table tr th { width: 12%;}
#PerformanceDetails2 table tr td:first-child,
#PerformanceDetails3 table tr td:first-child,
#PerformanceDetails4 table tr td:first-child,
#PerformanceDetails5 table tr td:first-child,
#PerformanceDetails2 table tr th:first-child,
#PerformanceDetails3 table tr th:first-child,
#PerformanceDetails4 table tr th:first-child,
#PerformanceDetails5 table tr th:first-child  { width: 20%;}
#PerformanceDetails2 table tr td:nth-child(3),
#PerformanceDetails3 table tr td:nth-child(3),
#PerformanceDetails4 table tr td:nth-child(3),
#PerformanceDetails5 table tr td:nth-child(3),
#PerformanceDetails2 table tr th:nth-child(3),
#PerformanceDetails3 table tr th:nth-child(3),
#PerformanceDetails4 table tr th:nth-child(3),
#PerformanceDetails5 table tr th:nth-child(3) { width: 20%;}
#PerformanceDetails2 table tr td:nth-child(4),
#PerformanceDetails3 table tr td:nth-child(4),
#PerformanceDetails4 table tr td:nth-child(4),
#PerformanceDetails5 table tr td:nth-child(4),
#PerformanceDetails2 table tr th:nth-child(4),
#PerformanceDetails3 table tr th:nth-child(4),
#PerformanceDetails4 table tr th:nth-child(4) ,
#PerformanceDetails5 table tr th:nth-child(4) { width: 12%;}
td div.notes_footer{font-size:9px !important ; }
#ConcentrationLimits table thead tr th:nth-child(2){ width: 60%;}
#AccountStatements1  tr td:first-child,
#ActivitiesSinceCutOff1   tr td:first-child{ width: 70%;}
#AccountStatements2  tr td:first-child,
#ActivitiesSinceCutOff2   tr td:first-child{ width: 70%;}
#ActivitiesSinceCutOff3 tr td:nth-child(2){width: 20% !important;}
#AccountStatements4 tr td:nth-child(2){width: 20% !important;}
#AcquisitionCriteria table tr td:first-child,
#AcquisitionCriteria1 table tr td:first-child,
#AcquisitionCriteria2 table tr td:first-child{ width: 60%;}
#AcquisitionCriteria table tr td,
#AcquisitionCriteria1 table tr td,
#AcquisitionCriteria2 table tr td{ width: 20%;}
#PrePaymentsAndDefaultRates  table tr td:first-child{ width: 20%;}
#PrePaymentsAndDefaultRates2  table tr td:first-child{ width: 20%;}
#PrePaymentsAndDefaultRates table tr td,
#PrePaymentsAndDefaultRates2 table tr td,
#PrePaymentsAndDefaultRates table tr th,
#PrePaymentsAndDefaultRates2 table tr th  { width: 5%;}
// //  new
#loansforbearance{margin-top: -70px !important;}
#forbearance_title {margin-top: -5px;}
#PerformanceDetails5{margin-top:-10px !important}
#principal_footer{line-height:27px !important}
#prepayments-and-defaultrates{margin-top:-40px !important;}

.umb #Date {page-break-before:always; }
.umb #InterestPayments {page-break-before:always; }
.umb #DealFeesAndExpenses {page-break-before:always; }
.Charlesfort #Date {page-break-before:always; }
.Charlesfort #Payments {page-break-before:always; }
.Charlesfort #Factors {page-break-before:always; }
.Charlesfort #FeesAndExpenses {page-break-before:always; }
.Charlesfort #InterestCoverageRatio {page-break-before:always; }
.Charlesfort #OvercollateralizationRatio {page-break-before:always; }
.Charlesfort #AccountSummaryReport {page-break-before:always; }
.Charlesfort #RatingStratification  table tr th:first-child,
.Charlesfort #RatingStratification  table tr td:first-child{ width: 30%;}
.Charlesfort #AggregatePrincipalBalanceOfAllCollateralizedDebtObligation  table tr td:first-child{ width: 50%;}
.Charlesfort #CashAccounts {page-break-before:always; }
.Charlesfort #RatingsDetail {page-break-before:always; }
.Charlesfort #RatingsAtIssuance {page-break-before:always; }
.Charlesfort #RatingStratification {page-break-before:always; }
.Charlesfort #PortfolioInterestDetail {page-break-before:always; }
.Charlesfort #PortfolioPrincipalDetail {page-break-before:always; }
.Charlesfort #PortfolioCollateralSalesActivityDetail {page-break-before:always; }
.Charlesfort #AggregatePrincipalBalanceOfAllCollateralizedDebtObligation {page-break-before:always; }
.Charlesfort #ServicerStratificationTables {page-break-before:always; }
.Charlesfort #PortfolioRequirementsTestsSummary {page-break-before:always; }
.Charlesfort #PriorityOfPayments {page-break-before:always; }
.Charlesfort #CollateralInformation {page-break-before:always; }
.Charlesfort #InvestmentCreditEventDetail {page-break-before:always; }
.Charlesfort #RatingStratification  table {margin-bottom:40px;}
.Charlesfort #AggregatePrincipalBalanceOfAllCollateralizedDebtObligation  table {margin-bottom:30px;}
    </style>`;
  const updatedData = data.concat(newStyle);
  logger.debug("updatedData"+updatedData);


// logger.debug("DATAAAA"+data)
logger.debug("Investor Report!!!")

let options = {
  "height": "297mm",
  "width": "420mm",
  "renderDelay": 1000,
  // "format": "A4",
  // "orientation": "landscape",
  "header": {
    "height": "75px",
    "margin": "0px !important",
  },
  "footer": {
    "height": "10mm",

    "contents": {
      first: '<div style="color: #444;background: #fff;margin-left:-10px;margin-right:-10px;top:-13px;position: relative;text-align:right;display:block;font-size:12px;padding:10px 10px 15px 5px">Page {{page}}/<span>{{pages}}</span></div>',
      // 2: 'Second page', // Any page number is working. 1-based index
      default: '<span style="color: #444;background: #fff;margin-left:-10px;margin-right:-10px;margin-top:-12px;text-align:right;display:block;font-size:12px;padding:5px 10px 15px 5px">Page {{page}}/<span>{{pages}}</span></span>', // fallback value
      last: '<span style="color: #444;background: #fff;margin-left:-10px;margin-right:-10px;margin-top:-14px;text-align:right;display:block;font-size:12px;padding:5px 10px 15px 5px">Page {{page}}/<span>{{pages}}</span></span>'
    }
  },

};
var reportname = "Investor-report-Charlesfort-" + req.body.dealId + "-" + req.body.month + "-" + req.body.year + ".pdf"
pdf.create(updatedData, options).toFile(reportname, function (err, data) {
  if (err) {
    res.send(err);
  } else {
    console.log("File created successfully");
    res.send({ 'filename': reportname });
  }
});
})


app.get('/:filename', function (req, res) {
  logger.debug("req.params.filename", req.params.filename);
  var Filename=req.params.filename;
  logger.debug("dirname:"+__dirname)
  res.sendFile(path.join(__dirname + '/'+Filename));
});

//-------------------------------------------------------------------------------------------------------------------------
// app.listen(3005, function () {
//   logger.debug('server started on port 3005');
// });

var listen = app.listen(process.env.PORT, () => logger.debug('server started on port ' + process.env.PORT));
listen.setTimeout(2000000000); 
