#!/usr/bin/env node
//===================================//
//
//  Elasticsearch query template v0.1.1
//
//===================================//

var program = require('commander'),
    request = require('request'),
    colors  = require('colors'),
    path    = require('path')


var sendMailAction  = require('./lib/sendmail').sendMailAction,
    changeUnit      = require('./lib/changeunit').changeUnit,
    parseTimeframe  = require('./lib/parsetimeframe').parseTimeframe,
    parseThreshold  = require('./lib/parsethreshold').parseThreshold,
    parseDatepat    = require('./lib/parsedatepattern.js').parseDatepat,
    operators       = require('./lib/operators.js').operators,
		findPropPath    = require('./lib/objutils.js').findPropPath,
		useObjPath      = require('./lib/objutils.js').useObjPath

program
  .version('0.1.2')
  .usage('[options]')
  .option('-h, --elhost [value]', 'Elasticsearch host. Default: 127.0.0.1')
  .option('-p, --elport [value]', 'Elasticsearch port. Default: 9200')
  .option('--index [value]', 'Index pattern. Default: collectd-YYYY.MM.dd')
  .option('--op [value]', 'Support > == !== <. Default >')
  .option('-T, --threshold [value]', 'You dont say')
  .option('-m, --compare-mode [mode]', 'Accept hit / dir. Default: hit')
  .option('-o, --only-met', 'Output only when threshold is met')
  .option('-c, --config [value]', 'the config file to use')


if (!process.argv.slice(2).length) {
  program.outputHelp(make_blue);
  process.exit();        
}

program.on('--help', function(){
  console.log('');
});


program.parse(process.argv);

// config goes here
var configpath = path.join(process.cwd(), program.config)
var config     = require(configpath)


var elhost      = program.elhost        || config.elhost,
    elport      = program.elport        || config.elport,
    index       = program.index         || config.index, 
    threshold   = program.threshold     || config.threshold,
    op          = program.op            || config.op,
    comparemode = program.compareMode   || config.compareMode,
    onlymet     = program.onlyMet       || config.onlyMet,
    sendmail    = config.sendMail
    interestedfield = config.interestedField

if (config.datepat) {
  index = index + parseDatepat(config.datepat)
  config.fullIndex = index
}


var postcontent = config.postContent

var options = {
  url: "http://" + elhost + ":" + elport + "/" + index + "/_search",
  headers: {
    'Content-Type': 'application/json'
  },
    json: postcontent
}

config.querySource = options

console.log(JSON.stringify(options))

// result goes here
var sumobj = {}
var interestedRes = []

request.post(options,function(err, response, body){

  if (err) throw err

  console.log(JSON.stringify(body))

  if (body.error) {
    console.log(JSON.stringify(body.error))
    process.exit(1)
  }

	
//  if (body.hits.hits.length > 0) {
//    sumobj.lastvalue = body.hits.hits[body.hits.hits.length-1]["_source"][qfield]
//  }

  if (comparemode == "hit") {

    sumobj.hitscount = body.hits.total
    sumobj.hits = body.hits.hits
		sumobj.hits.forEach(e => {
			var hitobj = {}
			interestedfield.forEach(interestedkey => {
        if (interestedkey in e._source) {
          hitobj[interestedkey] = e._source[interestedkey]
				}
			})
			interestedRes.push(hitobj)
		})
		sumobj.interestedRes = interestedRes

    if (operators[op](body.hits.total, threshold)) {
      sumobj.ismet = true
    } else {
      sumobj.ismet = false
    }

  } else if (comparemode == "agg") {

    var obj = body.aggregations
    var hitscount = Object.values(obj)[0]["buckets"].length
    var hits = Object.values(obj)[0]["buckets"]
    sumobj.hitscount = hitscount
    sumobj.hits = hits
		sumobj.hits.forEach(e => {
			var hitobj = {}
			interestedfield.forEach(interestedkey => {
        if (interestedkey in e) {
          hitobj[interestedkey] = e[interestedkey].value
				}
			})
			interestedRes.push(hitobj)
		})
		sumobj.interestedRes = interestedRes

    if (operators[op](hitscount, threshold)) {
      sumobj.ismet = true
    } else {
      sumobj.ismet = false
    }
  }

  sumobj.threshold = threshold
  sumobj.operator = op

  console.log(JSON.stringify(sumobj))

// Output
  if (sumobj.ismet) {
    if (sendmail) {
      sendMailAction(config, sumobj)
    }
  } else {
    if (onlymet) {
      process.exit()
    }
  }

})


function make_blue(txt) {
  return colors.blue(txt); 
}
