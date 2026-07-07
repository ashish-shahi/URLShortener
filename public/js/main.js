function isValidUrl(str) {
    try {
        const parsed = new URL(str);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

function getRandomStr() {
    let str = '';
    for (let i = 0; i < 5; i++) {
        let toss = Math.floor(Math.random() * 2);
        let s = Math.floor(Math.random() * 26) + 97;
        let n = Math.floor(Math.random() * 10) + 48;
        str += toss ? String.fromCharCode(s) : String.fromCharCode(n);
    }
    return str;
}

module.exports = {isValidUrl, getRandomStr};