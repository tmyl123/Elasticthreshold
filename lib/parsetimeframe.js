//timeframe = 60s
//return {timeframeval: 60, timeframeunit: "s", timeframe: "60s"}
function parseTimeframe(timeframe) {
  var obj = {}
  obj.timeframeval = parseInt(timeframe)
  obj.timeframeunit = timeframe.slice(parseInt(timeframe).toString().length)
  obj.timeframe = timeframe
  switch(obj.timeframeunit) {
    case 's':
        obj.timeframesecond = obj.timeframeval
        break;
    case 'm':
        obj.timeframesecond = obj.timeframeval * 60
        break;
    case 'h':
        obj.timeframesecond = obj.timeframeval * 60 * 60
        break;
    case 'd':
        obj.timeframesecond = obj.timeframeval * 60 * 60 * 24
        break;
    default:
        obj.timeframesecond = obj.timeframeval
  }
  return obj
}

module.exports = {
  parseTimeframe: parseTimeframe
}
