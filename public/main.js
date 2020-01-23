const bins = new Canv('canvas', {
    fullscreen: true,
    address: "63 Burrendong Road, Coombabah",
    async getDates() {
        try {
            address = encodeURIComponent(this.address);
            const request = await fetch(`/dates?address=${address}`);
            const response = await request.json();
            if (!response.result) {
                return false;
            } else {
                return response.result;
            }
        } catch (e) {
            return e;
        }
    },

    submitAddress() {
        const address = document.getElementById("address-input").value.trim();
        if (address && address !== "") {
            this.address = address;
            this.display = true;
            this.dates = false;
            this.getDates().then(dates => {
                if(dates) {
                    this.dates = dates;
                } else {
                    this.display = false;
                }
            })
        }
    },

    setup() {
        this.transition = 0.1;
        this.textColor = 255;
        this.images = {
            green: new Pic("./images/green.png"),
            recycle: new Pic("./images/recycle.png"),
            waste: new Pic("./images/waste.png")
        };

        this.texts = {
            green: new Text("").setColor(this.textColor),
            recycle: new Text("").setColor(this.textColor),
            waste: new Text("").setColor(this.textColor)
        }

        this.dates = false;
        this.display = false;

        this.withinTime = "withinWeek";
        this.w = 105;
        this.h = 170;

        this.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    },

    update() {
        if(this.width > 500) {
            this.padding = 200;
        } else {
            this.padding = (this.w / 2);
        }

        const y = this.halfHeight(this.h);
        const bins = Object.keys(this.images);
        bins.forEach((bin, i) => {
            const x = this.map(i, 0, bins.length - 1, this.padding, this.width-this.padding);
            this.images[bin].width = this.w;
            this.images[bin].height = this.h;
            this.images[bin].x = x - (this.w / 2);
            this.images[bin].y = y;
            this.texts[bin].textAlign = "center";
            this.texts[bin].fontSize = 16;
            this.texts[bin].x = x;
            this.texts[bin].y = y + this.h;

            if (this.dates) {
                const date = this.dates[this.withinTime][bin];
                this.images[bin].opacity = date ? 1 : 0.01;
                const display = this.days[new Date(date).getDay()];
                this.texts[bin].string = date ? display : "";
            } else {
                this.images[bin].opacity = 1;
                this.texts[bin].string = "Loading...";
            }
        });
    },

    draw() {
        this.background = 0;
        if(this.display) {
            Object.keys(this.images).forEach(bin => {
                this.add(this.images[bin]);
                this.add(this.texts[bin]);
            });
        }
    }
});