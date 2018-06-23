var fs             = require('fs'),
    ethold         = require('./ethold.js').ethold,
		normalizedPath = require("path").join(__dirname, "configs")

//FOR EACH CRON(TASK), WE HAVE THREE PLACES TO MODIFIED IN BACKEND
//TASKFARM + SET/CLEAR INTERVAL + FILE

//THIS USE TO STORE OUR RUNNING CRON
var taskFarm = {}

//ALL CONFIGS IN DIRECTORY
var allConfs = fs.readdirSync(normalizedPath)

//START ALL CRON
function cronInit() {
  allConfs.forEach(function(file) {
    var config = require("./configs/" + file);
		if (config.status.isrunning) {
      cronStart(config)
		}
  });
}

var intervalSec = 60

//START CRON
function cronStart(config) {
		console.log("CRON START")
	var interval = config.interval * intervalSec * 1000,
		  runTimer = interval / 1000

	const configFileName = './configs/' + config.name  +'.json'
	const configFile = JSON.parse(fs.readFileSync(configFileName))
				
  
  taskFarm[config.name] = setInterval(function() {

	taskFarm[config.name].ismet      = configFile.status.ismet || false
	taskFarm[config.name].recurrence = configFile.status.recurrence || 0


		runTimer --
		if (runTimer == 0) {
		  ethold(config, function(queryRes) {
//	    console.log(queryRes)

			  runTimer = interval / 1000

				if (taskFarm[config.name].ismet !== queryRes.summary.ismet) {
					console.log("not same")
				  taskFarm[config.name].recurrence = 0
				} else {
					console.log("same")
					taskFarm[config.name].recurrence += 1
				}

		    taskFarm[config.name].ismet  = queryRes.summary.ismet
		    configFile.status.ismet      = taskFarm[config.name].ismet
     	  configFile.status.recurrence = taskFarm[config.name].recurrence

	    })
		}

		taskFarm[config.name].runTimer = runTimer

    configFile.status.runTimer   = taskFarm[config.name].runTimer
     

    //WRITE STAT INTO CONFIG.STATUS
			fs.writeFileSync(configFileName, JSON.stringify(configFile, undefined, 2))

	
  }, 1000)
}

// PRINT ALL CRON, DEBUG ONLY
//setInterval(function(){
//  for (var cronname in taskFarm) {
//    console.log(
//  					cronname, 
//  					taskFarm[cronname].runTimer, 
//  					taskFarm[cronname].ismet, 
//  					taskFarm[cronname].recurrence
//  	)
//  }
//},1000)




//STOP CRON
function cronStop(config) {
		console.log("CRON STOP")

	const configFileName = './configs/' + config.name  +'.json'
	const configFile = JSON.parse(fs.readFileSync(configFileName))

	configFile.status.ismet      = taskFarm[config.name].ismet
  configFile.status.recurrence = taskFarm[config.name].recurrence

  configFile.status.runTimer   = 0

	fs.writeFileSync(configFileName, JSON.stringify(configFile, undefined, 2))

  clearInterval(taskFarm[config.name])
  delete taskFarm[config.name]
}


//TOGGLE CRON STATE
function toggleCron(config) {
	if (config.status.isrunning) {
		cronStart(config)
	} else if (!config.status.isrunning) {
		cronStop(config)
	}
}


module.exports = {
  cronInit: cronInit,
	toggleCron: toggleCron
}


