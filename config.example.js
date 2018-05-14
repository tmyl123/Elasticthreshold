var config       = {}

//BASIC INFORMATION
config.elhost        = "127.0.01"
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
              "gt": "now-5m",
              "lt": "now"
            }
          }
        }
      ]
    }
  }
}

//THRESHOLD DEFINATION
config.compareMode   = "hit"
config.threshold     = 1
config.op            = ">"


//EXTRA OUTPUT
config.interestedField   = ["host", "hit", "@timestamp"]
config.referenceLink     = "http://kibana/searchresult"
config.referenceName     = "kibana search result"


//MAIL CONFIGURATION
config.sendMail      = true
config.mailService   = "gmail"
config.mailUser      = "<tux@gmail.com>"
config.mailPass      = "<tuxbestpassword>"
config.mailTo        = "<foo@gmail.com>"
config.mailSubject   = "Met the threshold"
config.mailbody      = "/home/user/eq/mailbodies/general.pug"

//MISCELLANEOUS
config.onlyMet       = false

module.exports = config
