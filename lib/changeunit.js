//function changeUnit(value, unit, interval) {
//  switch(unit) {
//    case "bit":
//        return value / interval
//      break;
//    case "kbit":
//        return value * 1000 / interval
//      break;
//    case "mbit":
//        return value * 1000 * 1000 / interval
//      break;
//    case "byte":
//        return value * 8 / interval
//      break;
//    default:
//        return value / interval
//  }
//}

function changeUnit(value, from, to) {
  switch(from) {
    case "bit":
      switch(to) {
        case "bit":
          return value
          break;
        case "kbit":
          return value / 1000
          break;
        case "mbit":
          return value / 1000 / 1000
          break;
        case "byte":
          return value / 8
          break;
        default:
          return value
      }
      break;
    case "kbit":
      switch(to) {
        case "bit":
          return value * 1000
          break;
        case "kbit":
          return value
          break;
        case "mbit":
          return value / 1000
          break;
        case "byte":
          return value * 1000 / 8
          break;
        default:
          return value
      }
      break;
    case "mbit":
      switch(to) {
        case "bit":
          return value * 1000 * 1000
          break;
        case "kbit":
          return value * 1000
          break;
        case "mbit":
          return value
          break;
        case "byte":
          return value * 1000 * 1000 / 8
          break;
        default:
          return value
      }
      break;
    case "byte":
      switch(to) {
        case "bit":
          return value * 8
          break;
        case "kbit":
          return value * 8 / 1000
          break;
        case "mbit":
          return value * 8 / 1000 / 1000
          break;
        case "byte":
          return value
          break;
        default:
          return value
      }
      break;
    case "s":
      switch(to) {
        case "s":
          return value
          break;
        case "m":
          return value / 60
          break;
        case "h":
          return value / 60 / 60
          break;
        case "d":
          return value / 60 / 60 / 12
          break;
        default:
          return value
      }
      break;
    case "m":
      switch(to) {
        case "s":
          return value * 60
          break;
        case "m":
          return value
          break;
        case "h":
          return value / 60
          break;
        case "d":
          return value / 60 / 12
          break;
        default:
          return value
      }
      break;
    case "h":
      switch(to) {
        case "s":
          return value * 60 * 60
          break;
        case "m":
          return value * 60
          break;
        case "h":
          return value
          break;
        case "d":
          return value / 12
          break;
        default:
          return value
      }
      break;
    case "d":
      switch(to) {
        case "s":
          return value * 60 * 60 * 12
          break;
        case "m":
          return value * 60 * 12
          break;
        case "h":
          return value * 12
          break;
        case "d":
          return value
          break;
        default:
          return value
      }
      break;
    default:
      return value
  }
}

module.exports = {
  changeUnit: changeUnit
}
