# eqtool (temp name)

### Description
this tool is make for querying threshold in elasticsearch.
although we have Elastalert, but as far as I know, they don't provide
derivative aggregation query, which we use them a lot.

<br>

### Usage
`node eq.js -q foo.keyword:tux -r "@timestamp=gt:now-5m&lt:now"`

<br>

### Config file & Parameter explaination

`elhost` : Elasticsearch host
`elport` : Elaticsearch port
`index` : Index to query
`field` : Aggregation field. use only in `dir` mode
`rawUnit` : The origin unit in your data. use only in `dir` mode
`timeframe` : How many time in a bucket.
`rawInterval` : If your data have polling interval, put interval here, otherwise put 1
`threshhold` : The threshold to define an alert
`op` : The operator compare to each query result
`compareMode` : Support `hit` mode and `dir` mode
`singleMode` : The response will only return one value
`exitMode` : The program will use exit code to represent value
`onlyMet` : Output only when threshold is met
`sendMail` : If we are going to send mail or not

<br>
### Full configuration example
```
var config = {}

config.elhost        = "127.0.0.1"
config.elport        = "9200"        //if you have index pattern, you can use YYYY-MM-dd
config.index         = "test-index"  //agg field, if your query is text, and you don't car about agg, you can omit this
config.field         = "value"
config.isCounter     = false
config.queryUnit     = "count"
config.rawUnit       = "byte"        
config.timeframe     = "1m"          //how many time per buckets, this value usually same as rawInterval
config.rawInterval   = 1             //if your data have polling interval, put interval here, otherwise put 1
config.threshhold    = "2"           // 5, 5bit/s, 5mbit/s
config.op            = ">"           //available: ">" "==" "!==" "<"
config.compareMode   = "hit",        //available: "dir" "raw"
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
```
