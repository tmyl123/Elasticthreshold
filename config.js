var config       = {},
    auth         = require("./auth.js"),
    parseDatepat = require("./lib/parsedatepattern.js").parseDatepat

config.elhost        = "10.10.80.25",
config.elport        = "9200",
config.datepat       = "daily", //index date pattern, support: "daily"
config.index         = "pa001-" + parseDatepat(config.datepat), 
config.field         = "value", //agg field, if your query is text, and you don't care about agg, you can omit this
//config.isCounter     = false, 
config.queryUnit     = "count"
config.rawUnit       = "byte", 
config.timeframe     = "1m",   //how many time per buckets, this value usually same as rawInterval
config.rawInterval   = 1,      //if your data have polling interval, put interval here, otherwise put 1
config.threshold    = "2",  // 5, 5bit/s, 5mbit/s
config.op            = ">",  //available: ">" "==" "!==" "<"
config.compareMode   = "hit",//available: "dir" "raw"
config.singleMode    = false,
config.exitMode      = false,
config.onlyMet       = false,
config.sendMail      = true,
config.mailService   = "gmail"
config.mailAuth      = auth

module.exports = config
