const parseSerchKeyQuotes = (str) => {
    if(str.includes(`'`) || str.includes(`"`)){
        str = `"` + str.substring(1,str.length-1) + `"`;
    }
    return str;
}

module.exports = {
    parseSerchKeyQuotes
}
