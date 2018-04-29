#!/usr/bin/env node
//===================================//
//
//  Elasticsearch query template v0.1.1
//
//===================================//

var program = require("commander"),
    request = require("request"),
    colors  = require('colors')

var config = require('./config')

var sendMailAction  = require('./lib/sendmail').sendMailAction,
    changeUnit      = require('./lib/changeunit').changeUnit,
    parseTimeframe  = require('./lib/parsetimeframe').parseTimeframe,
    parseThreshhold = require('./lib/parsethreshold').parseThreshhold

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
//  .option('-c, --is-counter', 'Set this argument if your data type is counter.')
  .option('-q, --query-string [value]', 'host.keyword:Moo_Kibana01,type_instance:ens160 Default: none')
  .option('-f, --field [value]', 'The field you are interested in. Default: value')
  .option('-r, --query-range [value]', '@timestamp=gt:now-2m&lt:now,value=gt:1000')
  .option('-T, --threshold [value]', 'You dont say')
  .option('-m, --compare-mode [mode]', 'Accept hit / dir. Default: hit')
  .option('-s, --single-mode [mode]', 'If -s is set, the response will only return one value. accept hit / val')
  .option('-e, --exit-mode', 'If -e is set, the program will use exit code to represent value. must use with -s')
  .option('-o, --only-met', 'Output only when threshold is met')
  .option('-A, --met-action', 'the action if we met the condition')


if (!process.argv.slice(2).length) {
  program.outputHelp(make_blue);
  process.exit();        
}

program.on('--help', function(){
  console.log('');
  console.log('Full Examples:');
  console.log('');
  console.log('eqtool -q host.keyword:Moo_Kibana01,type_instance:ens160 -r "@timestamp=gt:now-2m&lt:now,tx=gt:1000" -u mbit -U byte -T 5 -f tx -i 1 -I 1 --op ">" -m dir');
  console.log('');
  console.log('eqtool -q host.keyword:Moo_Kibana01,type_instance:ens160 -r "@timestamp=gt:now-2m&lt:now,tx=gt:1000" -u count -U byte -T 1 -f tx -i 1 -I 1 --op ">" -m hit');
  console.log('');
  console.log('--index test-index -q foo.keyword:tux -r "@timestamp=gt:now-2m&lt:now" -T 0 -f tux');
  console.log('');
});


program.parse(process.argv);

var querymust = []
// making query object
program.queryString.split(',').forEach(e => {
  var termobj = {}
  termobj.term = {}
  termobj['term'][e.split(':')[0]] = e.split(':')[1]
  querymust.push(termobj)
})

// making range object
program.queryRange.split(',').forEach(e => {
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


// config goes here
var elhost      = program.elhost        || config.elhost,
    elport      = program.elport        || config.elport,
    index       = program.index         || config.index, 
    qfield      = program.field         || config.field,
    iscounter   = program.isCounter     || config.isCounter,
    queryunit   = program.queryUnit     || config.queryUnit,
    rawunit     = program.rawUnit       || config.rawUnit,
    timeframe   = parseTimeframe(config.timeframe),
    rawinterval = program.rawInterval   || config.rawInterval,
    threshold  = parseThreshhold(config.threshold)
    qthreshold = threshold.thresholdval / threshold.timesecond,
    op          = program.op            || config.op,
    comparemode = program.compareMode   || config.compareMode,
    singlemode  = program.singleMode    || config.singleMode,
    exitmode    = program.exitMode      || config.exitMode,
    onlymet     = program.onlyMet       || config.onlyMet,
    sendmail    = program.sendMail      || config.sendMail,
    mailauth    = config.mailAuth


//console.log(threshold.thresholdval, threshold.thresholdunit, threshold.timesecond)
// content post to elastic
var postcontent = {
  "sort":[  {"@timestamp": { "order" : "asc" }} ],
  "query": {
    "bool": {
      "must": querymust
    }
  },
  "aggs" : {
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


// Output
  if (onlymet && !sumobj.ismet) {
    process.exit()
  }

  if (singlemode) {
    switch(singlemode) {
      case "count":
        if (exitmode) {
          console.log(sumobj.hitscount)
          process.exit(sumobj.hitscount)
        } else {
          console.log(sumobj.hitscount)
        }
        break;
      case "val":
        if (exitmode) {
          console.log(sumobj.lastvalue)
          process.exit(sumobj.lastvalue)
        } else {
          console.log(sumobj.lastvalue)
        }
        break;
      default:
        console.log("available mode: hit / val")
        program.outputHelp(make_blue);
        process.exit();        
    }
  } else {
    console.log(JSON.stringify(sumobj))
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
      sendMailAction(mailauth, mailbody)
    }
  }

})


function make_blue(txt) {
  return colors.blue(txt); 
}
