#!/usr/bin/env node
//===================================//
//
//  Elasticsearch query template v0.1.1
//
//===================================//

var program = require("commander"),
    request = require("request"),
    colors  = require('colors')


var sendMailAction  = require('./lib/sendmail').sendMailAction,
    changeUnit      = require('./lib/changeunit').changeUnit,
    parseTimeframe  = require('./lib/parsetimeframe').parseTimeframe,
    parseThreshold  = require('./lib/parsethreshold').parseThreshold,
		parseDatepat    = require("./lib/parsedatepattern.js").parseDatepat

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

// the operators (you don't say)
var operators = {
    '==': function(a, b) { return a == b },
    '!==': function(a, b) { return a !== b },
    '>': function(a, b) { return a > b },
    '<': function(a, b) { return a < b },
};


//var config = require('./config')

// config goes here
var config      = require(program.config)
    elhost      = program.elhost        || config.elhost,
    elport      = program.elport        || config.elport,
    index       = program.index         || config.index, 
		datefield   = program.datefield     || config.datefield,
    qfield      = program.field         || config.field,
    iscounter   = program.isCounter     || config.isCounter,
    queryunit   = program.queryUnit     || config.queryUnit,
    rawunit     = program.rawUnit       || config.rawUnit,
    timeframe   = parseTimeframe(config.timeframe),
    rawinterval = program.rawInterval   || config.rawInterval,
    threshold   = parseThreshold(config.threshold),
    qthreshold  = threshold.thresholdval / threshold.timesecond,
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
  "sort":[  { [datefield]: { "order" : "asc" }} ],
  "query": {
    "bool": {
      "must": querymust
    }
  },
}

var aggs = {
  "val_per_interval" : {
    "date_histogram" : {
      "field" : "@timestamp",
        "interval" : timeframe.timeframe
    },
    "aggs": {
      "avg_val": {
        "avg": {
          "field": qfield
        }
      },
      "val_speed": {
        "derivative": {
          "buckets_path": "avg_val"
        }
      }
    }
  }
}

if (config.withAggs) {
  postcontent.aggs = aggs
}

var options = {
  url: "http://" + elhost + ":" + elport + "/" + index + "/_search",
  headers: {
    'Content-Type': 'application/json'
  },
    json: postcontent
}

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

  if (comparemode == "dir") {
    sumobj.result = resarr

    body.aggregations.val_per_interval.buckets.forEach(e => {
      var compareobj = {}
      if (typeof(e.val_speed) == "object") {

        if (operators[op](changeUnit(e.val_speed.value, rawunit, threshold.thresholdunit) / rawinterval, qthreshold)) {
          compareobj.ismet = true
        } else {
          compareobj.ismet = false
        }
          compareobj.threshold = qthreshold
          compareobj.value = changeUnit(e.val_speed.value, rawunit, threshold.thresholdunit) / rawinterval
          compareobj.operater = op
          //compareobj.timestamp = new Date (e.key + (1000 * 60 * 60 * 8))
          compareobj.timestamp = new Date (e.key)
          resarr.push(compareobj)
      } else {
        resarr.push({})
      }
    })


  var ismetarr = resarr.filter(e => e.ismet)
//  console.log(resarr)

  sumobj.metcount = ismetarr.length
  if (sumobj.metcount > 0) {
    sumobj.ismet = true
    sumobj.lastmetvalue = ismetarr[ismetarr.length-1]["value"]
    sumobj.lastmettime  = ismetarr[ismetarr.length-1]["timestamp"]
  } else {
    sumobj.ismet = false
  }
  sumobj.lastvalue = resarr[resarr.length-1]["value"]

  } else if (comparemode == "hit") {
    if (body.hits.hits.length > 0) {
      sumobj.lastvalue = body.hits.hits[body.hits.hits.length-1]["_source"][qfield]
    }
    if (operators[op](body.hits.total, qthreshold)) {
      sumobj.ismet = true
    } else {
      sumobj.ismet = false
    }
  } else {
    console.log("available mode: dir / hit")
    program.outputHelp(make_blue);
    process.exit();        
  }
  sumobj.threshold = qthreshold
  sumobj.operator = op
  sumobj.hitscount = body.hits.total
  sumobj.hits = body.hits.hits

	console.log(JSON.stringify(sumobj))

// Output
  if (onlymet && !sumobj.ismet) {
    process.exit()
  }

  if (sumobj.ismet) {
    if (sendmail) {
      var mailbody

      if (comparemode == "hit") {
        mailbody = '觸發設置的次數(' + threshold.thresholdval + '次), 當前次數: ' + sumobj.hitscount + '次<br>' 
      } else if (comparemode == "dir") {
        mailbody = '觸發設置的速度(' + threshold.threshold + '), ' + sumobj.metcount + '次<br>' 
        mailbody += '最後值: ' + parseFloat(sumobj.lastmetvalue.toFixed(2))  +  ' ' + threshold.thresholdunit+ '/' + threshold.timeunit + '<br>'
        mailbody += '出現於: ' + sumobj.lastmettime + '<br>'
      }

      mailbody += '索引: ' + index + '<br>'
      mailbody += '查詢字串: ' + program.queryString + '<br>'
      mailbody += '查詢範圍: ' + program.queryRange + '<br>'
      sendMailAction(config, sumobj)
    }
  }

})


function make_blue(txt) {
  return colors.blue(txt); 
}
