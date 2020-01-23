const fetch = require("node-fetch");
const jsdom = require("jsdom");
const {
    JSDOM
} = jsdom;


class Scraper {
    static async fetch(url, opts) {
        const request = await fetch(url, opts);
        return request;
    }

    static document(html) {
        const {
            document
        } = (new JSDOM(html)).window;
        return document;
    }

    static getToday() {
        const d = new Date();
        d.setHours(0, 0, 0, 0)
        return d;
    }

    static getInDays(num=1) {
        const d = this.getToday();
        d.setDate(d.getDate() + (num+1));
        return d;
    }

    static daysBetween(d1, d2) {
        const diff = Math.abs(d1.getTime() - d2.getTime());
        return diff / (1000 * 60 * 60 * 24);
    }
}

module.exports = Scraper;