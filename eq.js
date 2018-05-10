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
		operators       = require('./lib/operators.js').operators

program
  .version('0.1.2')
  .usage('[options]')
  .option('-h, --elhost [value]', 'Elasticsearch host. Default: 127.0.0.1')
  .option('-p, --elport [value]', 'Elasticsearch port. Default: 9200')
  .option('--index [value]', 'Index pattern. Default: collectd-YYYY.MM.dd')
  .option('-u, --query-unit [value]', 'Unit use for threshold, accept bit / kbit / mbit / byte / count. Default: count')
  .option('-U, --raw-unit [value]', 'The original field unit, accept bit / kbit / mbit / byte / count. Default: count')
  .option('-t, --timeframe [value]', 'Group time bucket per n minute. Default: 1')
  .option('-I, --raw-interval [value]', 'If your database receive data per n second, put n here. Default: 1')
  .option('--op [value]', 'Support > == !== <. Default >')
  .option('-q, --query-string [value]', 'host.keyword:Moo_Kibana01,type_instance:ens160 Default: none')
  .option('-f, --field [value]', 'The field you are interested in. Default: value')
  .option('-r, --query-range [value]', '@timestamp=gt:now-2m&lt:now,value=gt:1000')
  .option('-T, --threshold [value]', 'You dont say')
  .option('-m, --compare-mode [mode]', 'Accept hit / dir. Default: hit')
  .option('-o, --only-met', 'Output only when threshold is met')
  .option('-A, --met-action', 'the action if we met the condition')
  .option('-c, --config [value]', 'the config file to use')


if (!process.argv.slice(2).length) {
  program.outputHelp(make_blue);
  process.exit();        
}

program.on('--help', function(){
  console.log('');
});


program.parse(process.argv);


// elastic use GMT+0
var t      = new Date(),
    offset = t.getTimezoneOffset() * 60 * 1000
    t    -= -offset

// prepend 0 to month and date
var d = new Date(t)
var mydate = d.getFullYear() + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2) 

// config goes here
var configpath = path.join(process.cwd(), program.config)
var config     = require(configpath)


var elhost      = program.elhost        || config.elhost,
    elport      = program.elport        || config.elport,
    index       = program.index         || config.index, 
    datefield   = program.datefield     || config.datefield,
    qfield      = program.field         || config.field,
    iscounter   = program.isCounter     || config.isCounter,
    queryunit   = program.queryUnit     || config.queryUnit,
    rawunit     = program.rawUnit       || config.rawUnit,
    timeframe   = parseTimeframe(config.timeframe),
    rawinterval = program.rawInterval   || config.rawInterval,
    //threshold   = parseThreshold(config.threshold),
    //qthreshold  = threshold.thresholdval / threshold.timesecond,
		threshold   = config.threshold
    op          = program.op            || config.op,
    comparemode = program.compareMode   || config.compareMode,
    onlymet     = program.onlyMet       || config.onlyMet,
    sendmail    = program.sendMail      || config.sendMail,
    querystring = program.queryString   || config.queryString,
    queryrange  = program.queryRange    || config.queryRange


if (config.datepat) {
  index = index + parseDatepat(config.datepat)
  config.fullIndex = index
}

var querymust = []
// making query object
querystring.split(',').forEach(e => {
  var termobj = {}
  termobj.term = {}
  termobj['term'][e.split(':')[0]] = e.split(':')[1]
  querymust.push(termobj)
})

// making range object
if (queryrange) {
  queryrange.split(',').forEach(e => {
    var rangeobj = {}
    rangeobj.range = {}
    e.split('=').forEach(a => {
      field = e.split('=')[0]
      condition = e.split('=')[1]
      rangeobj.range[field] = {}
      condition.split("&").forEach(c => {
        gtlt = c.split(':')[0]
        val = c.split(':')[1]
        rangeobj.range[field][gtlt] = val
      })
    })
    querymust.push(rangeobj)
  })
}



//console.log(threshold.thresholdval, threshold.thresholdunit, threshold.timesecond)
// content post to elastic
var postcontent = {
  "sort":[],
  "query": {
    "bool": {
      "must": querymust
    }
  },
}

if (config.withAggs) {
  postcontent.aggs = config.aggs
}

if (config.sortField) {
	var obj = {}
	obj.order = config.sortOrder
  postcontent.sort[0] = {[config.sortField]: obj}
}

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
var resarr = []

request.post(options,function(err, response, body){

  if (err) throw err

  console.log(JSON.stringify(body))

  if (body.error) {
    console.log(JSON.stringify(body.error))
    process.exit(1)
  }

	
  if (body.hits.hits.length > 0) {
    sumobj.lastvalue = body.hits.hits[body.hits.hits.length-1]["_source"][qfield]
  }

	if (comparemode == "hit") {

    sumobj.hitscount = body.hits.total
    sumobj.hits = body.hits.hits

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

    if (operators[op](hitscount, threshold)) {
      sumobj.ismet = true
    } else {
      sumobj.ismet = false
    }
	}

  sumobj.threshold = threshold
  sumobj.operator = op

	console.log(JSON.stringify(sumobj))

	if (sendmail) {
    sendMailAction(config, sumobj)
	}

// Output
  if (onlymet && !sumobj.ismet) {
    process.exit()
  }

})


function make_blue(txt) {
  return colors.blue(txt); 
}
