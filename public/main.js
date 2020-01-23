const bins = new Canv('canvas', {
    fullscreen: true,
    async getDates(address) {
        try {
            address = encodeURIComponent(address);
            const request = await fetch(`/dates?address=${address}`);
            const response = await request.json();
            if(!response.result) {
                return false;
            } else {
                return response.result;
            }            
        } catch(e) {
            return e;
        }
    },

    submitAddress() {
        const address = document.getElementById("address-input").value.trim();
        if(address && address !== "") {
            this.getDates(address).then(dates => {
                console.log(dates);
            })
        }
    },

    setup() {
        this.images = {
            green: new Pic("./images/green.png"),
            recycle: new Pic("./images/recycle.png"),
            waste: new Pic("./images/waste.png")
        };

        
        this.background = 0;
    },

    update() {

    },

    draw() {

        if(this.mouseDown) {
            this.add(new Circle(this.mouseX, this.mouseY, 4).setColor(255))
        }
    }
});