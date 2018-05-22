# elasticthreshold

### Description
This tool is make for querying threshold in elasticsearch. It may not be the most easy to use tool, but elastic enough.
although we have Elastalert, but AFAIK they don't provide derivative aggregation query, which we use them a lot.

<br>

### Download
`git clone https://github.com/tmyl123/Elasticthreshold.git`

`cd elasticthreshold`

`npm install`

<br>

### Config
`cp config.example.js myconfig.js` and fill up the needed information and the query you are interested in.

<br>

### Usage
`node ethold.js -c myconfig.js`

<br>

---

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
config.referenceLink     = "http://kibana/searchresult"
config.referenceName     = "kibana search result"


//MAIL CONFIGURATION
config.sendMail      = true
config.mailService   = "gmail"
config.mailUser      = "<tux@gmail.com>"
config.mailPass      = "<tuxbestpassword>"
config.mailTo        = "<foo@gmail.com>"
config.mailSubject   = "Met the threshold"
config.mailbody      = "/home/user/Elasticthreshold/mailbodies/general.pug"

//MISCELLANEOUS
config.onlyMet       = false

module.exports = config
```

<br>

### TODOs
* Fix some bugs
* Add custom action
* Add some extrafunction to result(change unit, timezone.. etc)
