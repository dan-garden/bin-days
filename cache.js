const fs = require("fs");
const crypto = require('crypto');

module.exports = class Cache {
    static getCacheId(url) {
        const unique = url;
        const hash = crypto.createHash('md5').update(unique).digest('hex');
        return hash;
    }
    
    static getCacheFile(id) {
        const cacheDir = "./cache/";
        return cacheDir + id + ".json";
    }
    
    static setCache(url, result) {
        const id = this.getCacheId(url);
        fs.writeFileSync(this.getCacheFile(id), JSON.stringify(result, null, 2));
        
        return result;
    }
    
    static getCache(url) {
        const id = this.getCacheId(url);
        if (fs.existsSync(this.getCacheFile(id))) {
            const result = fs.readFileSync(this.getCacheFile(id), "utf8");
            return JSON.parse(result);
        } else {
            return false;
        }
    }
}