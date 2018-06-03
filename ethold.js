#!/usr/bin/env node
//===================================//
//
//  Elasticsearch query template v0.1.3
//
//===================================//

var   request = require('request'),
      path    = require('path')


var sendMailAction  = require('./lib/sendmail').sendMailAction,
    changeUnit      = require('./lib/changeunit').changeUnit,
    parseTimeframe  = require('./lib/parsetimeframe').parseTimeframe,
    parseThreshold  = require('./lib/parsethreshold').parseThreshold,
    parseDatepat    = require('./lib/parsedatepattern.js').parseDatepat,
    operators       = require('./lib/operators.js').operators,
		findPropPath    = require('./lib/objutils.js').findPropPath,
		useObjPath      = require('./lib/objutils.js').useObjPath




function ethold(config, callback) {

  // result goes here
  var sumobj  = {},
			infoObj = {},
      interestedRes = []
  
  var elhost          =  config.elhost,
      elport          =  config.elport,
      index           =  config.index, 
      threshold       =  config.threshold,
      op              =  config.op,
      comparemode     =  config.compareMode,
      onlymet         =  config.onlyMet,
      sendmail        =  config.sendMail
      interestedfield =  config.interestedField
  
  if (config.datepat) {
    index = index + parseDatepat(config.datepat)
    config.fullIndex = index
  }
  
  
  var postcontent = config.postContent
  
  var options = {
    url: "http://" + elhost + ":" + elport + "/" + index + "/_search",
    headers: { 'Content-Type': 'application/json' },
		timeout: 2000,
    json: postcontent
  }
  
  
  //console.log(JSON.stringify(options))
	infoObj.requestOptions = options


  request.post(options,function(err, response, body){
  
    //if (err) throw err
    if (err) {
		  console.log("ERR")
		  console.log(err)
			callback(err)
			return
		}
  
    //console.log(JSON.stringify(body))
		infoObj.requestResult = body
  
    if (body.error) {
		  console.log("BODY ERR")
      console.log(JSON.stringify(body.error))
      callback(body.error)
      //process.exit(0)
			return
    }
  
  
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

		infoObj.summary = sumobj
  
    callback(infoObj)
  })
}


module.exports = {
  ethold: ethold
}
