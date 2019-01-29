var request = require('request'),
    pug     = require('pug'),
    path    = require('path')

var url = "http://192.168.130.89:2486/ipt"

function webHookAction(config, data) {
  console.log(config, '111')
  console.log(data, '222')
  if (config.skype) {
    console.log('send msg to skype')
  }

  var options = {
    url: url,
    headers: {
      'Content-Type': 'application/json'
    },
      json: {
        config: config,
        data: data  
    }
  }
  
  request.post(options,function(err, response, body){
    console.log(body)
  })
}


module.exports = {
  webHookAction: webHookAction
}
