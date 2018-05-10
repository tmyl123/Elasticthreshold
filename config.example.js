var config       = {}

//BASIC INFORMATION
config.elhost        = "127.0.0.1"
config.elport        = "9200"
config.datepat       = "daily"
config.index         = "myindex-"


//BASIC QUERY SETUP
config.queryString   = "tag:error"
config.queryRange    = "@timestamp=gt:now-50m&lt:now,bytes=gt:2000"


//AGGREGATION QUERY SETUP
config.withAggs      = true
config.field         = ""
config.queryUnit     = ""
config.rawUnit       = "" 
config.timeframe     = ""
config.rawInterval   = 1
config.datefield     = "@timestamp"

config.aggs = {
	"val_per_interval" : {
    "date_histogram" : {
      "field" : "@timestamp",
      "interval" : "5m"
    },
    "aggs": {
      "avg_val": {
        "avg": {
          "field": "hit"
        }
      },
      "val_speed": {
        "derivative": {
          "buckets_path": "avg_val"
        }
      },
			"speed_bucket_filter": {
        "bucket_selector": {
          "buckets_path": {
            "hitSpeed": "val_speed",
						"av": "avg_val"
        },
      "script": "params.hitSpeed !== null && params.hitSpeed > 100 && params.av > 2200"
    }
  }
    }
  }
}

//THRESHOLD DEFINATION
config.compareMode   = "agg"
config.threshold     = "1"
config.op            = ">"


//MAIL CONFIGURATION
config.sendMail      = true
config.mailService   = "gmail"
config.mailUser      = "<tux@gmail.com>"
config.mailPass      = "<tuxbestpassword>"
config.mailTo        = "<foo@gmail.com>"
config.mailSubject   = "Met the threshold"
config.mailbody      = "./mailbodies/general_agg.pug"

//MISCELLANEOUS
config.sortField     = "@timestamp"
config.sortOrder     = "asc"
config.onlyMet       = false

module.exports = config
