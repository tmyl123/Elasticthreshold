var config = {}

config.elhost        = "127.0.0.1",
config.elport        = "9200",
//if you have index pattern, you can use YYYY-MM-dd
config.index         = "test-index",
//agg field, if your query is text, and you don't car about agg, you can omit this
config.field         = "value",
config.isCounter     = false,
//config.queryUnit     = "count"
config.rawUnit       = "byte",
//how many time per buckets, this value usually same as rawInterval
config.timeframe     = "1m",
//if your data have polling interval, put interval here, otherwise put 1
config.rawInterval   = 1,
// 5, 5bit/s, 5mbit/s
config.threshhold    = "2",
//available: ">" "==" "!==" "<"
config.op            = ">",
//available: "dir" "raw"
config.compareMode   = "hit",
config.singleMode    = false,
config.exitMode      = false,
config.onlyMet       = false,
config.sendMail      = true,
config.mailService   = "gmail"
config.mailAuth      = {
  user: "<your gmail username>",
  pass: "<your gmail pass>"
}


//YYYY.MM.dd
function dailyPat() {
  var t      = new Date()
  var offset = t.getTimezoneOffset() * 60 * 1000
  t -= -offset
  var d      = new Date(t)
  var mydate = d.getFullYear() + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2)
  return mydate
}

module.exports = config
