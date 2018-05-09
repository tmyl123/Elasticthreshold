var config       = {},
    parseDatepat = require("./lib/parsedatepattern.js").parseDatepat

config.elhost        = "192.168.41.121",
config.elport        = "9200",
config.datepat       = "", //index date pattern, support: "daily"
config.index         = "test-index" + parseDatepat(config.datepat), 
config.datefield     = "@timestamp"
config.field         = "", //agg field, if your query is text, and you don't care about agg, you can omit this
//config.isCounter     = false, 
config.queryUnit     = "count"
config.rawUnit       = "byte", 
config.timeframe     = "1m",   //how many time per buckets, this value usually same as rawInterval
config.rawInterval   = 1,      //if your data have polling interval, put interval here, otherwise put 1
config.threshold    = "2",  // 5, 5bit/s, 5mbit/s
config.op            = ">",  //available: ">" "==" "!==" "<"
config.compareMode   = "hit",//available: "dir" "raw"
config.onlyMet       = false,
config.sendMail      = false,
config.mailService   = "gmail",
config.mailUser      = "tommymailbot@gmail.com",
config.mailPass      = "t9485432236",
config.mailTo        = "tommy.lin@pajops.com"

module.exports = config
