const Scraper = require("../../../scraper");


class goldcoast extends Scraper {
    static getWithinDays(months, num=1) {
        let withinWeek = {
            waste: false,
            green: false,
            recycle: false
        }
        months.forEach(month => {
            const waste =  month.waste.filter(day => {
                return (day >= this.getToday() && day <= this.getInDays(num))
            });
            if(waste.length) {
                withinWeek.waste = waste[0];
            }
            const green = month.green.filter(day => {
                return (day >= this.getToday() && day <= this.getInDays(num))
            });
            if(green.length) {
                withinWeek.green = green[0];
            }
            const recycle = month.recycle.filter(day => {
                return (day >= this.getToday() && day <= this.getInDays(num))
            });
            if(recycle.length) {
                withinWeek.recycle = recycle[0];
            }
        });
        return withinWeek;
    }

    static getMonths(document) {
        return Array.from(document.querySelectorAll(".calendar")).map(monthDom => {
            let month = monthDom.querySelector(".rcTitlebar").textContent.trim();
            let recycle = [];
            let waste = [];
            let green = [];
            let wasteDays = Array.from(monthDom.querySelectorAll(".waste")).map(d => d.title);
            let days = Array.from(monthDom.querySelectorAll("td")).map(d => {
                const date = d.title;
                wasteDays.forEach(wasteDay => {
                    if (date.startsWith(wasteDay)) {
                        waste.push(date);
                    }
                });

                if (d.classList.contains("recycle")) {
                    green.push(date);
                } else if (d.classList.contains("green")) {
                    recycle.push(date);
                }
            });

            month = month.replace(new Date().getFullYear(), "").trim();
            return {
                month,
                wasteDays,
                waste: waste.map(d => new Date(d)),
                recycle: recycle.map(d => new Date(d)),
                green: green.map(d => new Date(d)),
            }
        });
    }

    static async getDates(location) {
        try {
            let {street, suburb} = location;
            if (!street || !suburb || typeof street !== "string" || typeof suburb !== "string") {
                throw Error("Please enter a street name and suburb ")
            }
            street = street.toLowerCase();
            street = street.split(" ").map(n => {
                if (n === "st") {
                    n = "street";
                } else if (n === "rd") {
                    n = "road";
                }
                return n;
            }).join(" ");
            street = encodeURIComponent(street);

            suburb = suburb.toLowerCase();
            suburb = encodeURIComponent(suburb);
            const url = `https://www.goldcoast.qld.gov.au/contact-waste/recycling-calendar-results.aspx?streetname=${street}&suburb=${suburb}&inst=1`;
            const request = await this.fetch(url, {
                "credentials": "include",
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "accept-language": "en-AU,en-US;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1"
                },
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": null,
                "method": "GET",
                "mode": "cors"
            });
            const html = await request.text();
            const document = this.document(html);
            if (document.querySelector("h1").textContent === "Sorry") {
                throw Error("No results");
            } else {
                const months = this.getMonths(document);
                const withinDay = this.getWithinDays(months, 1);
                const withinWeek = this.getWithinDays(months, 7);

                const response = {
                    result: {
                        withinDay,
                        withinWeek,
                        months,   
                    }
                }

                return response;
            }
        } catch (e) {
            console.error(e);
            return {
                e,
                result: false
            }
        }
    }

    static async search(query) {
        const request = await this.fetch("https://www.goldcoast.qld.gov.au/contact-waste/controls/AutoComplete.asmx/GetStreetList", {
            "credentials": "include",
            "headers": {
                "accept": "*/*",
                "accept-language": "en-AU,en-US;q=0.9,en;q=0.8",
                "content-type": "application/json; charset=UTF-8",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://www.goldcoast.qld.gov.au/contact-waste/bin-day-finder.aspx",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": `{\"context\":{\"Text\":\"${query}\",\"NumberOfItems\":0}}`,
            "method": "POST",
            "mode": "cors"
        });

        const json = await request.json();
        const streets = (json.d || {
            items: []
        }).Items;

        const request2 = await this.fetch("https://www.goldcoast.qld.gov.au/contact-waste/bin-day-finder.aspx", {
            "credentials": "include",
            "headers": {
                "accept": "*/*",
                "accept-language": "en-AU,en-US;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-microsoftajax": "Delta=true",
                "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://www.goldcoast.qld.gov.au/contact-waste/bin-day-finder.aspx",
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": "ucBinDayFinderForm%24radsmgr=ucBinDayFinderForm%24ucBinDayFinderForm%24rajMainPanel%7CucBinDayFinderForm%24radcbStreetName&ucBinDayFinderForm_radsmgr_TSM=%3B%3BSystem.Web.Extensions%2C%20Version%3D4.0.0.0%2C%20Culture%3Dneutral%2C%20PublicKeyToken%3D31bf3856ad364e35%3Aen-US%3A93a6b8ed-f453-4cc5-9080-8017894b33b0%3Aea597d4b%3Ab25378d2%3BTelerik.Web.UI%2C%20Version%3D2014.3.1209.35%2C%20Culture%3Dneutral%2C%20PublicKeyToken%3D121fae78165ba3d4%3Aen-US%3A09ffa3bb-7bdc-46d0-9614-4a1d18b3bc8f%3A16e4e7cd%3Aed16cbdc%3Af7645509%3A24ee1bba%3Af46195d3%3A2003d0b8%3Ac128760b%3A88144a7a%3A1e771326%3Aaa288e2d%3A258f1c72&__EVENTTARGET=ucBinDayFinderForm%24radcbStreetName&__EVENTARGUMENT=%7B%22Index%22%3A0%7D&__VIEWSTATE=L%2BIRWjucUyv75%2FOAts0%2F%2FnAKWJuc6w%2F6303YbUik1atUVpjVnTulHqur3GEKCnXyZ39WqX2DBg8q9M1WBlWli7VYduPmwIzIlmPb2UlNqrJ7iPJ5IusBghSkYEXeA%2B5phbCunDA17zYqVL3iCtlpNQMdw1auH6fj4VSa1qkid%2F3ZrmH0WdgBVIOiJOIHqgl9koe8huURAkOtavlx%2FMguXtS%2B55lDBwTK1xzpizrkqN2UXDM%2BqYycOpQPoVyw41Kjgf9E3AwfXpE8Cu085bNcrR6Cs96QGXtldC0KY4mXE0Krw6Vml3gfi6kj6CtD7cCRKzGBTDKI1O3NdWB71ESBo%2BSRRApOWOtElYyeSrxXH08zStvaOS4YzrJ%2BRIh2D%2FeGIDUWC%2FchFcQznHXEaOSC8ZdQ1cXDjJNPUCU4HtzzTDohkVElVacPSQ7lSHPf5IlTN0R7IBD2A6nB1DCWXAibaIXzCJAIo8mq4c6c2EzOWE0F9jiRF77ksRSmyLqsyusHXnssyhvFocWChLdQ%2FApFskCUoNgx2PT2PpUIy5P3wRGozwU9CTcnwxiuaw6o8OTRcZF%2Fvl4uqRa5o2a7SxAaKTwLpvUXT%2F6QLMbb1VKaedgiCcTDTGLQXFSPwAb96f4pW%2BBncQFFJVWDwz9zmj7Og9dm3%2BqO%2BLz3a1QCO10iymDwIny4DZYq7RogjyAXoR1%2B%2F3LrGMVtCxUuSWZgd21B4CC5sp0I0g0aYnzDyvR%2FBDyRVm2xJ1zkI8hlPkGX1bmi4w513yFoGf3%2BFiSFe0AVjePyykuSMsjMZeO%2FVlK%2Bgp8KB4Db5CbrV%2FMXppfQjtCIt0N%2F5zwwih5uSmAI25QoNXSfhvHySivWdtc3qRy0KPNmbE%2Bd%2FdcZw0UHIkJKeoCSG8UVhbBtBQKFLdztShzLpPXPDePeOPVIG4UEl2dH21kzpU5tdy8lhxQ3YTpxD0gTjRpYs9wAPnsWuBxdXr8khaV0IOyfxPco0drAGopixFoJhcsDE2a2QrErdtWOTzMqeZ5I6Xa45RB53PFWCRUrwkFu91ZW0y7aw7DvnzBX%2BH9djv86PQLZoeBaZZ4sehzQmnKxWaCsrAcYq8%2B6edwh5he%2F%2FgnfElJNm1ixcbGA%2FLOcPuz4wQkog9%2BTa%2BSvrG7yDM0D9ir5maLH4y5fPC8AUXDkM4WX93KeaelnkFMxtKCFZDCVEX79VnrbpU74jnBVxd%2Fy4bsCjO%2FERvhTNJvEx94A2LUTSCWVnsrtC6Qj1mfKNIXV9Zg3QPbmvZZbnVN%2FOf3qgU9UZfwfrAtV9VaGO0FV7ZD4gRhmtNJv8jiNF0LviqX6rq%2FWeXmLPXAhadI3R0qtOqbzdyreYuo%2FZhrav%2BVyYAEKRlL1LjJVYlXp%2F0gTT4SA4DGczZFohLAaOWTsk4rxIpbqwOY4XPicnFFLoIxTMl7NByU%2BmN1NDstgDgGRESQhaXSqb61CInZt4eaX%2BO%2BJiJwCo%2Fzg5GmnN0%2F49KDgeM8Wc4VJYTnHG3VN%2Bm9vq6zt7KsY%2Bp0sOUlrFSJufIVtpbZkNopI3kDP6Tct3%2FYgPl10Me%2BWJjkxTkg%2BD0VANthYeg%2Bg7VeyVRjte%2FQGMrsIlVzKUELcZna%2BwQIfPXHmt8R0cPauSzPNIlnUGm4qCnk16znFcw1e7XwC6Bxfzzqb8v3bVDyQhjagh3ML%2FmFXeaPcqmxEwx8pHfKkOdbUEv6Cp%2FDiqLJOpASYDq8y%2Ba4c0hGpcFsT6R9YhKYaMbfJSsKC5CYeKIEDZbzNYXopgJd%2FisSyJ5xxVGa3QT34%2FvLO%2BfIZTv%2BHGI2MIf3jRmeMQ0t7jrfdosQQOL%2F00F1g%2FS2Aic3%2FgQHmcZ7zyvz%2Fe4F8YLqZQx%2B%2BXHkEVvdDnoVs5pYLjw6XroqCaaZa3CKz8dHtWORHBQqN%2B5fG%2BRRvCgcuIzwd26RWUQIvAMGTKYpf%2FXL%2BX6ccNEU91485F%2BI%3D&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=QAPUEYShPVdRwPmu56%2BcMvtZ6gbnPeVizviaLIlkMlZ5z0X2a%2BrfDX28Kf%2Fl9jJbC5O5zB3fQZvMfLYrUvcZXY3I3tXd4qJofSdZNrrAXRHk6hLY1nMVuDz2mpqvqCX6HDWh%2BMeYCSGcjMw9zC72kg%3D%3D&ucBinDayFinderForm%24radcbStreetName=BURRENDONG%20ROAD&ucBinDayFinderForm_radcbStreetName_ClientState=%7B%22logEntries%22%3A%5B%5D%2C%22value%22%3A%22BURRENDONG%20ROAD%22%2C%22text%22%3A%22BURRENDONG%20ROAD%22%2C%22enabled%22%3Atrue%2C%22checkedIndices%22%3A%5B%5D%2C%22checkedItemsTextOverflows%22%3Afalse%7D&ucBinDayFinderForm%24radcbSuburbName=&ucBinDayFinderForm_radcbSuburbName_ClientState=&__ASYNCPOST=true&RadAJAXControlID=ucBinDayFinderForm_rajMain",
            "method": "POST",
            "mode": "cors"
        });

        const result2 = await request2.text();

        return result2;

    }
}

module.exports = goldcoast;