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


//START CRON
function cronStart(config) {
		console.log("CRON START")
	var interval = config.interval * 60 * 1000,
		  runTimer = interval / 1000,
		  period   = 0
  
  taskFarm[config.name] = setInterval(function() {

		runTimer --
		if (runTimer == 0) {
		  ethold(config, function(queryRes) {
//	      console.log(queryRes)

		    taskFarm[config.name].ismet = queryRes.summary.ismet

		    period ++
			  runTimer = interval / 1000
	    })
		}

		taskFarm[config.name].runTimer = runTimer
		taskFarm[config.name].period   = period

    //WRITE STAT INTO CONFIG.STATUS
		for (var cronname in taskFarm) {
			const configFileName = './configs/' + cronname  +'.json'
		  const config = JSON.parse(fs.readFileSync(configFileName))

			config.status.runTimer = taskFarm[cronname].runTimer
			config.status.period   = taskFarm[cronname].period

			config.status.ismet    = taskFarm[config.name].ismet

//	    console.log(cronname, taskFarm[cronname].runTimer,  taskFarm[cronname].period, taskFarm[config.name].ismet)

			fs.writeFileSync(configFileName, JSON.stringify(config, undefined, 2))
		}
  }, 1000)
}


//STOP CRON
function cronStop(config) {
		console.log("CRON STOP")
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


