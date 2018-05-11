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
          "query_string": {
            "default_field": "message.keyword",
            "query": "something interesting*"
          }
        },
        {
          "range": {
            "logdate": {
              "gt": "now-1h",
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
config.threshold     = "1"
config.op            = ">"


//MAIL CONFIGURATION
config.sendMail      = false
config.mailService   = "gmail"
config.mailUser      = "<tux@gmail.com>"
config.mailPass      = "<tuxawesomepassword>"
config.mailTo        = "<foo@gmail.com>"
config.mailSubject   = "Met the threshold"
config.mailbody      = "./mailbodies/general.pug"

//MISCELLANEOUS
config.onlyMet       = false

module.exports = config
