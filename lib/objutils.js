function findPropPath(obj, name) {
    for (var prop in obj) {
        if (prop == name) {
            return name;
        } else if (typeof obj[prop] == "object") {
            var result = findPropPath(obj[prop], name);
            if (result) {
                return prop + '.' + result;
            }
        }
    }
    return null;    // Not strictly needed, but good style
}

function useObjPath(obj, path){
    for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        obj = obj[path[i]];
    };
    return obj;
};


module.exports = {
  findPropPath: findPropPath,
  useObjPath: useObjPath
}
