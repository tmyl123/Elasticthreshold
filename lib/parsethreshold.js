//threshold = 15bit/s
//return {thresholdval: 15, thresholdunit: "bit", threshold: "15bit/s", timeunit: "s", threshold.sencond: 1}
function parseThreshhold(threshold) {
  var obj = {}
  obj.thresholdval = parseInt(threshold)
  obj.thresholdunit = threshold.slice(parseInt(threshold).toString().length).split('/')[0]
  if (obj.thresholdunit == '') obj.thresholdunit = "count"
  obj.timeunit = threshold.split('/')[1]
  if (obj.timeunit == undefined) obj.timeunit = 1
  obj.threshold = threshold

  switch(obj.timeunit) {
     case 's':
         obj.timesecond = 1
         break;
     case 'm':
         obj.timesecond = 1 * 60
         break;
     case 'h':
         obj.timesecond = 1 * 60 * 60
         break;
     case 'd':
         obj.timesecond = 1 * 60 * 60 * 24
         break;
     default:
         obj.timesecond = 1
   }

  return obj
}

module.exports = {
  parseThreshhold: parseThreshhold
}
