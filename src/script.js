const API_URL = window.location.protocol === 'file:' ? 'http://localhost:8000' : 'https://below.black';

Vue.component('carousel', {
    props : ['n', 'src', 'title', 'credit'],
    data: function () {
      return {
        img: [],
        current : '',
        i : 0
      }
    },
    template: '<div class="carousel-wrapper"><div class="carousel"><img v-bind:src="current"/><div v-if="credit" class="overlay"><p> {{title}} </p><p>&copy; {{credit}} </p></div></div></div>',
    mounted : function() {
        let i = this.n;
        while(i --> 0) {
            this.img.push('./media/carousel/' + this.src + '/' + (this.n - 1 - i) + '.jpg');
        }
        this.current = this.img[this.i];
        this.i = (this.i + 1)%this.n;
        setInterval(() => {
            this.current = this.img[this.i];
            this.i = (this.i + 1)%this.n;
        }, 1500 + Math.floor(Math.random()*2000));
    }
  });

Vue.component('sceno', {
    props : ['n', 'src', 'title', 'credit'],
    template: '<div><div class="sceno-title"><p> {{title}} </p><p v-if="credit" >&copy; {{credit}} </p></div><div class="sceno-img-wrapper" v-for="img in imgs"><img v-bind:src="img"/></div></div>',
    data: function () {
        return {
          imgs: [],
          current : '',
          i : 0
        }
      },
    mounted : function() {
        let i = this.n;
        while(i --> 0) {
            /*console.log("n : " + this.n + ", i : " + i);*/
            this.imgs.push('./media/carousel/' + this.src + '/' + (this.n - 1 - i) + '.jpg');
        }
        console.log(this.imgs)
    }
  })

  Vue.component('vj', {
    props : ['n'],
    template: '<div><div class="vj-img-wrapper" v-for="img in imgs"><img v-bind:src="img"/></div></div>',
    data: function () {
        return {
          imgs: [],
          current : '',
          i : 0
        }
      },
    mounted : function() {
        let i = this.n;
        while(i --> 0) {
            this.imgs.push('./media/vj/' + (this.n - 1 - i) + '.jpg');
        }
        console.log(this.imgs)
    }
  })

var humanMonth = {
    1: 'janvier',
    2: 'février',
    3: 'mars',
    4: 'avril',
    5: 'mai',
    6: 'juin',
    7: 'juillet',
    8: 'août',
    9: 'septembre',
    10: 'octobre',
    11: 'novembre',
    12: 'décembre'
}

var now = new Date().getTime();
var futureFlag = false;
var nextEvent = null;

var newLines = true;

//evts is included from events.js 
//evts = []

/*var evt = evts.map(event => {
    let chunks = event.date.split(' ');
    event.hdate = chunks.map((c, i) => ((i == 1) ? humanMonth[parseInt(c)] : c)).join(' ');
    event.date = Date.parse([chunks[1], chunks[0], chunks[2]].join(' '));
    //event.future = futureFlag = (event.date > now) && !futureFlag;
    event.future = (event.date > now);
    if (event.future && !futureFlag) {
        nextEvent = event;
        futureFlag = true;
    }
    //console.log(event.date, now, event.future, event.hdate);
    return event;
});*/


var vueh = new Vue({
    el: '#app-below',
    data: {
        currentSection: (window.location.hash) ? window.location.hash.substr(1) : 'home',
        events: [],
        vj: [],
        sceno : [],
        nextEvent: nextEvent,
        newLines : true
    },
    computed: {
        availableTags: function () {
            var tagsF = {};
            this.posts.forEach(post => {
                //create or add into object
                post.tags.forEach(tag => ((tagsF[tag] === undefined) ? tagsF[tag] = 1 : tagsF[tag]++));
            });
            return Object.keys(tagsF).map(tag => ({ value: tag })).sort((prev, next) => tagsF[prev.value] < tagsF[next.value]).slice(0, 42);
        }
    },
    methods: {
        load: function (section) {
            console.log(section);
            this.currentSection = section;
            /*if(section == 'vinyl') window.location.hash = section;*/
            this.animateLines();
        },
        animateLines: function() {
            if(this.currentSection == 'home') {
                document.getElementById("c").style.display = "block";
                this.newLines = true;
            }
            else this.newLines = false; //document.getElementById("c").style.display = "none";
        },
        getEvents: function() {
            var self = this;
            fetch(API_URL + '/api/events').then(function (response) {
            // The API call was successful!
                return response.json();
            }).then(function (data) {
                // This is the JSON from our response
                //evts = data
                console.log(data);
                self.events = data.map(event => {
                    let chunks = event.date.split(' ');
                    event.hdate = chunks.map((c, i) => ((i == 1) ? humanMonth[parseInt(c)] : c)).join(' ');
                    event.date = Date.parse([chunks[1], chunks[0], chunks[2]].join(' '));
                    //event.future = futureFlag = (event.date > now) && !futureFlag;
                    event.future = (event.date > now);
                    if (event.future && !futureFlag) {
                        self.nextEvent = event;
                        futureFlag = true;
                    }
                    console.log(event.date, now, event.future, event.hdate);
                    return event;
                }).reverse();
                console.log(self.events)
                //self.$forceUpdate();
            }).catch(function (err) {
                // There was an error
                console.warn('Something went wrong.', err);
            });
        },
        getVJ: function() {
            var self = this;
            fetch(API_URL + '/api/vj').then(function (response) {
            // The API call was successful!
                return response.json();
            }).then(function (data) {
                // This is the JSON from our response
                //evts = data
                console.log(data);
                self.vj = data;
                console.log(self.vj)
                //self.$forceUpdate();
            }).catch(function (err) {
                // There was an error
                console.warn('Something went wrong.', err);
            });
        },
        getSceno: function() {
            var self = this;
            fetch(API_URL + '/api/sceno').then(function (response) {
            // The API call was successful!
                return response.json();
            }).then(function (data) {
                // This is the JSON from our response
                //evts = data
                console.log(data);
                self.sceno = data;
                console.log(self.sceno)
                //self.$forceUpdate();
            }).catch(function (err) {
                // There was an error
                console.warn('Something went wrong.', err);
            });
        }
    },
    beforeMount: function() {
        this.getEvents()
        this.getVJ()
        this.getSceno()
    },
    updated: function () {

    },
    mounted: function () {
        document.getElementById("c").style.display = "block";

        document.body.style.filter = "invert(1)";
        var self = this;
        setTimeout(function() {
            document.body.style.filter = "";
            document.getElementById("logo-loader").style.display = "none";
            document.getElementById("app-below").style.display = "block";
            self.animateLines()
            setTimeout(function() {
                self.newLines = false;
            },2500)
        }, 2500)


        //this.getEvents()
        var param = 'fbclid'; //remove ugly fbclid from URL
        if (location.search.indexOf(param + '=') !== -1) {
            var replace = '';
            try {
                var url = new URL(location);
                url.searchParams.delete(param);
                replace = url.href;
            } catch (ex) {
                var regExp = new RegExp('[?&]' + param + '=.*$');
                replace = location.search.replace(regExp, '');
                replace = location.pathname + replace + location.hash;
            }
            history.replaceState(null, '', replace);
        }
    }
});

