var config = {}

config.elhost        = "10.10.80.25",
config.elport        = "9200", //if you have index pattern, you can use YYYY-MM-dd
config.index         = "pa001-2018.05.03", 
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
config.sendMail      = false,
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
