# eqtool (temp name)

### Description
this tool is make for querying threshold in elasticsearch.  
Although we have Elastalert, but as far as I know, they don't provide derivative aggregation query, which we use them a lot.

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
`onlyMet` : Output only when threshold is met  
`sendMail` : If we are going to send mail or not  

<br>

### Full configuration example

```
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
```

<br>

### TODOs
* Fix some bugs
* Add custom agg parameter
* Redefine search flow
* Add custom action
