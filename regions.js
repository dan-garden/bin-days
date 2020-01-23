const fs = require("fs");
const path = require("path");
const storage = require("./cache");
const mapquest = require("mapquest");
const mq_key = "yHXfJ411qysld8qnmJE5GNDiBtJA9PkG";

class Regions {
    static parseLocation(location) {
        Object.keys(location).forEach(key => {
            if(key.startsWith("adminArea") && key.endsWith("Type")) {
                let type = location[key].toLowerCase();
                let valueKey = key.replace("Type", "");
                let value = location[valueKey];
                delete location[key];
                delete location[valueKey];
                if(type === "neighborhood") {
                    type = "suburb";
                }
                location[type] = value;
            }
        });

        return location;
    }

    static async geocodeAddress(address) {
        console.log(address);
        try {
            if(!address || address.trim() === "") {
                throw new Error("Please do not leave address blank.");
            }

            const cacheKey = "address:"+address;
            const cache = storage.getCache(cacheKey);

            if(cache) {
                // console.log("cache found");
                return cache;
            } else {
                const result = await new Promise((resolve, reject) => {
                    mapquest.geocode({
                        address,
                        key: mq_key
                    }, (err, location) => {
                        if(err) {
                            reject(err);
                        } else {
                            console.log(location);
                            location = this.parseLocation(location);
                            resolve(location);
                        }
                    });
                });

                storage.setCache(cacheKey, result);
                return result;
            }
    
        } catch(e) {
            console.error(e);
            return {
                e
            }
        }
    }

    static getRegions() {
        const regions = {};
        const regionDir = __dirname + "/regions";
        const countryDirs = fs.readdirSync(regionDir);
        countryDirs.forEach(countryDir => {
            let stateDirs = fs.readdirSync(regionDir + "/" + countryDir);
            regions[countryDir] = {};
            stateDirs.forEach(stateDir => {
                const areas = fs.readdirSync(regionDir + "/" + countryDir + "/" + stateDir);
                regions[countryDir][stateDir] = areas.map(a => a.replace(".js", ""));
            })
        })
        return regions;
    }

    static async getDates(address) {
        try {
            const location = await this.geocodeAddress(address);
            const regions = this.getRegions();
            let {country, state, county, city, suburb, street} = location;
            state = state.split(" ").join("").toLowerCase();
            city = city.split(" ").join("").toLowerCase();
            // suburb = suburb.split(" ").join("").toLowerCase();
            if(!country || !regions[country]) {
                throw new Error("Country not supported");
            }
    
            if(!state || !regions[country][state]) {
                throw new Error("State not supported");
            }
    
            if(!city || !regions[country][state].includes(city)) {
                throw new Error("City not supported");
            }
    
            const region = require(`./regions/${country}/${state}/${city}`);
            const request = await region.getDates(location);
            return request;
        } catch(e) {
            return {
                error: e.message
            }
        }
    }
}

module.exports = Regions;