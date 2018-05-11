# eqtool (temp name)

### Description
this tool is make for querying threshold in elasticsearch.  
Although we have Elastalert, but as far as I know, they don't provide derivative aggregation query, which we use them a lot.

<br>

### Usage
`node eq.js -c configs/wsa_hit.js`

<br>

### Config file & Parameter explaination

`elhost` : Elasticsearch host  
`elport` : Elaticsearch port  
`index` : Index to query  
`threshhold` : The threshold to define an alert  
`op` : The operator compare to each query result  
`compareMode` : Support `hit` mode and `agg` mode  
`onlyMet` : Output only when threshold is met  
`sendMail` : If we are going to send mail or not  

<br>

### Full configuration example

```
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
config.interestedField = ["host", "hit", "@timestamp"]


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

```

<br>

### TODOs
* Fix some bugs
* Add custom action
* Add some extrafunction to result(change unit, timezone.. etc)
