# ethold

### Description
A gui interface to setup alert for elasticsearch data.


<br>

### Download
`git clone https://github.com/tmyl123/ethold.git`

`cd ethold`

`npm install`

<br>

### Config
`mkdir configs`

`cp config_example.json configs` 

`mv ethold.env.js config/`

<br>

### Usage

* FOR DEV
`npm run dev`  &&  `node app.js`  and open browser at `localhost:8080`

* FOR PROD
`npm run build` && `pm2 start app.js` and open browser at `localhost:3000`

<br>

---

### Config file & Parameter explaination

`elhost` : Elasticsearch host  
`elport` : Elaticsearch port  
`index` : Index to query  
`threshhold` : The threshold to define an alert  
`op` : The operator compare to each query result  
`compareMode` : Support `hit` mode and `agg` mode  
`sendMail` : If we are going to send mail or not  

<br>


<br>

### TODOs
* Fix some bugs
* Add custom action
* Add some extrafunction to result(change unit, timezone.. etc)
