//YYYY.MM.dd
function  parseDatepat(pattern) {
  if (pattern == "daily") {
    var t      = new Date()
    var offset = t.getTimezoneOffset() * 60 * 1000
    t -= -offset
    var d      = new Date(t)
    var mydate = d.getFullYear() + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2)
    return mydate
  } else {
    return ""
  }
}


module.exports = {
  parseDatepat: parseDatepat
}
