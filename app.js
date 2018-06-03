var http       = require('http'),
    express    = require('express'),
    app        = express(),
    server     = http.createServer(app),
		io         = require('socket.io').listen(server),
    fs         = require('fs'),
    bodyParser = require('body-parser'),
		ethold     = require('./ethold.js').ethold,
		normalizedPath = require("path").join(__dirname, "configs"),
    cron       = require('./cron.js'),
		path       = require('path')

//PATH
app.use(express.static(__dirname + '/dist/'));
app.use(express.static('node_modules'));


//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});


//SERVER LISTENT
server.listen(3000, function() {
    console.log("Node listen on port 3000");
});


//READ POST CONTENT
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())


//INITALIZE CRON: READ FROM CONFIGS
cron.cronInit()


io.on('connect', function(socket) {
    console.log("client connect!")
    socket.on('changeconfig', function(operation) {
			console.log("socket: someone " + operation)
        io.emit("changeconfig", operation);
    });
		//SO THIS IS JUST GETCONFIG IN SOCKET VERSION
    socket.on('getAllStat', function() {
			//console.log("client get config from socket")
	    var configs = []
      var files = fs.readdirSync(normalizedPath),
	    		counter = 0
      fs.readdirSync(normalizedPath).forEach(function(file) {
	    	fs.readFile('./configs/' + file, (err, data) => {
          if (err) throw err;
          var config = JSON.parse(data)
          configs.push(config)
	    		counter ++
	    		if (counter == files.length) {
            socket.emit("resAllStat", configs);
	    		}
        });
      });
    });
});


//app.get('/', function(req, res) {
//  res.sendFile(__dirname + '/index.html');
//});


//ENDPOINT GOES HERE
//USE READFILE INSTEAD OF REQUIRE TO AVOID CACHED CONFIG
app.get('/getallconf', function(req, res) {
	var configs = []
  var files = fs.readdirSync(normalizedPath),
			counter = 0
  fs.readdirSync(normalizedPath).forEach(function(file) {
		fs.readFile('./configs/' + file, (err, data) => {
      if (err) throw err;
      var config = JSON.parse(data)
      configs.push(config)
			counter ++
			if (counter == files.length) {
        res.send(configs);
			}
    });
  });
	//console.log(files)
});


//WRITE CONFIG
function writeConf(config, callback) {
	console.log(config.name)
	fs.writeFile('./configs/' + config.name + '.json' ,JSON.stringify(config, undefined, 2), (err) => {
	  if (err) throw err
		callback()
	})
}

//SAVE EDIT CONFIG
app.post('/saveconf', function(req, res) {
	fs.unlinkSync('./configs/' + req.body.originItemName  + '.json')
	writeConf(req.body.item, function() {
	  res.send("OK")
	}) 
});

//ADD NEW CONFIG
app.post('/addconf', function(req, res) {
	writeConf(req.body.item, function() {
	  res.send("OK")
	}) 
});

//EDIT CONFIG; THIS IS USED TO BROCAST THAT SOMEONE IS EDITING
app.post('/editconf', function(req, res) {
	writeConf(req.body.item, function() {
	  res.send("OK")
	}) 
});


//REMOVE CONFIG
app.post('/removeconf', function(req, res) {
	fs.unlinkSync('./configs/' + req.body.item.name  + '.json')
	res.send("OK")
});


//COPY EDIT CONFIG
app.post('/copyconf', function(req, res) {
	var fileexist = true
	var name = req.body.item.name
	while (fileexist) {
		try {
      fs.accessSync('./configs/' + name + '.json')
      console.log('file exist!');
		  name += '-copy'
    } catch (err) {
      console.error('file not exist~');
    	  fileexist = false
				req.body.item.name = name
				writeConf(req.body.item, function() {
				  res.send("OK")
				}) 
    }
	}
}); 

//});


//TEST CONFIG
app.post('/testconf', function(req, res) {
  ethold(req.body.item, function(queryRes) {
	  console.log(queryRes)
		res.send(queryRes)
	})
})


//START|STOP CRON
app.post('/togglecron', function(req, res) {
//	console.log(JSON.stringify(req.body.item, undefined, 2))
	writeConf(req.body.item, function() {
    cron.toggleCron(req.body.item)	
	}) 
	res.send("received change stat")
})
