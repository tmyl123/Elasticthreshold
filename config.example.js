var config       = {}

//BASIC INFORMATION
config.elhost        = "127.0.0.1"
config.elport        = "9200"
config.datepat       = "daily"
config.index         = "myindex-"


//BASIC QUERY SETUP
config.queryString   = "tag:error"
config.queryRange    = "@timestamp=gt:now-5m&lt:now,hit=gt:1000"


//AGGREGATION QUERY SETUP
config.withAggs      = false
config.field         = ""
config.queryUnit     = ""
config.rawUnit       = "" 
config.timeframe     = ""
config.rawInterval   = 1
config.datefield     = "@timestamp"


//THRESHOLD DEFINATION
config.threshold     = "1"
config.op            = ">"
config.compareMode   = "hit"
config.onlyMet       = false


//MAIL CONFIGURATION
config.sendMail      = true
config.mailService   = "gmail"
config.mailUser      = "<foo@gmail.com>"
config.mailPass      = "<password>"
config.mailTo        = "<bar@gmail.com>"
config.mailSubject   = "Met the threshold"
config.mailbody      = "./mailbodies/general.pug"

module.exports = config
