var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var fs = require('fs'),
    path = require('path');
var unzip = require('unzip');
var app = express();

app.use(bodyParser.json());
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use('/upload/unzip', express.static(path.join(__dirname, 'upload/unzip')));


var port = 3000;
var fileName; 
var Storage = multer.diskStorage({
    destination: function (req, res, callback) {
        callback(null, "./upload");
    },
    filename: function (req, res, callback) {
        var dateTimeStamp = Date.now();
        fileName = "file_"+ dateTimeStamp + "_" + res.originalname;
        callback(null, fileName);
    }
});

var upload = multer({ storage: Storage }).single("imgUploader"); 

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});


app.set('View engine', 'ejs');


var filePath;
var filePaths = [];
var list;
app.post("/upload", function (req, res) {

    upload(req, res, function (err) {      
        if (err) 
            res.send("Oops.....upload fail")
        else {
            var fileType = require('mime').lookup(fileName).split("/")[1]
            if (fileType == "zip"){
                fs.createReadStream('./upload/'+ fileName).pipe(unzip.Extract({ path: 'upload/unzip' }));
                fs.readdir('./upload/unzip/', (err, files)=>{
                    files.forEach(file => {
                        filePaths.push('./upload/unzip/'+file);
                    });
                    // res.send(filePaths);
                    res.render('links.ejs', { filePaths: filePaths})
                })
                        

            }
            else
                res.redirect('./upload/'+fileName);
        
        }
        
    });
});

app.listen(port);