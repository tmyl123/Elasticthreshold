var config       = {}

//BASIC INFORMATION
config.elhost        = "127.0.0.1"
config.elport        = "9200"
config.datepat       = "daily"
config.index         = "myindex-"


//QUERYSETUP
config.postContent = {
  "query": {
    "bool": {
      "must": [
        {
          "term": {
          "tag.keyword": "ERROR"
          }
        },
        {
          "range": {
            "hit": {
              "gt": "10",
            }
          }
        },
        {
          "range": {
            "@timestamp": {
              "gt": "now-1h",
              "lt": "now"
            }
          }
        }
      ]
    }
  },
  "aggs" : {
    "tx_per_interval" : {
      "date_histogram" : {
        "field" : "@timestamp",
          "interval" : "5m"
      },
      "aggs": {
        "avg_hit": {
          "avg": {
            "field": "hit"
          }
        },
        "hit_speed": {
          "derivative": {
            "buckets_path": "avg_hit"
          }
        },
        "speed_bucket_filter": {
          "bucket_selector": {
              "buckets_path": {
                "hitSpeed": "hit_speed"
              },
           "script": "params.hitSpeed !== null && params.hitSpeed > 200"
          }
        }
      }
    }
  }
}

//THRESHOLD DEFINATION
config.compareMode   = "agg"
config.threshold     = 1
config.op            = ">"


//EXTRA OUTPUT
config.interestedField = ["avg_hit", "hit_speed"]


//MAIL CONFIGURATION
config.sendMail      = true
config.mailService   = "gmail"
config.mailUser      = "<tux@gmail.com>"
config.mailPass      = "tuxbestpassword"
config.mailTo        = "<foo@gmail.com>"
config.mailSubject   = "Met the threshold"
config.mailbody      = "/home/user/eq/mailbodies/general.pug"

//MISCELLANEOUS
config.onlyMet       = false

module.exports = config
