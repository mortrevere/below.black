const API_URL = window.location.protocol === 'file:' ? 'http://localhost:8000' : 'https://below.black';

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

var vueh = new Vue({
    el: '#app-admin-below',
    data: {
        currentSection: (window.location.hash) ? window.location.hash.substr(1) : 'events',
        events: [],
        event: { year: "2024" },
        creds: {},
        //token: document.cookie.startsWith("token=") ? document.cookie.substr(6) : "",
        token: "",
        headers: new Headers()
    },
    computed: {

    },
    methods: {
        load: function (section) {
            console.log(section);
            this.currentSection = section;
            if (section == 'vinyl') window.location.hash = section;
        },
        addEvent: function () {
            var self = this;
            check = confirm("T'es sûr frère ?\n\n" + JSON.stringify(this.event));
            if (!check) return;
            body = this.event;
            fetch(API_URL + '/api/event', { method: 'PUT', mode: 'cors', headers: self.headers, body: JSON.stringify(body) }).then(function (response) {
                alert("C'est bon");
                self.getEvents();
            }).catch(function (error) {
                alert('ça a foiré');
            });
        },
        login: function () {
            var self = this;
            fetch(API_URL + '/api/auth', { method: 'POST', mode: 'cors', headers: self.headers, body: JSON.stringify(this.creds) }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (data.token) {
                    console.log(data.token)
                    self.token = data.token
                    self.headers.append("token", data.token)
                    //document.cookie = "token=" + data.token; 
                    console.log(self.headers)
                }
            }).catch(function (error) {
                alert("ça a foiré, t'es qui fdp ?");
            });
        },
        deleteEvent: function (event) {
            var self = this;
            check = confirm("T'es sûr.e ?\n\n");
            if (!check) return;
            check = confirm("T'es VRAIMENT sûr.e ? Sinon je te monte en l'air\n\n" + JSON.stringify(event));
            if (!check) return;
            chunks = event.date.split(" ")
            event.year = chunks[2]
            event.month = chunks[0]
            event.day = chunks[1]
            fetch(API_URL + '/api/event', { method: 'DELETE', mode: 'cors', headers: self.headers, body: JSON.stringify(event) }).then(function (response) {
                alert("C'est bon c'est supprimé");
                self.getEvents();
            }).catch(function (error) {
                alert('déso ça a foiré');
            });
        },
        getEvents: function () {
            var self = this;
            console.log(self.headers);
            fetch(API_URL + '/api/events', { headers: self.headers }).then(function (response) {
                return response.json();
            }).then(function (data) {
                self.events = data.map(event => {
                    console.log(event)
                    let chunks = event.date.split(' ');
                    event.hdate = chunks.map((c, i) => ((i == 1) ? humanMonth[parseInt(c)] : c)).join(' ');
                    event.date = [chunks[1], chunks[0], chunks[2]].join(' ');
                    //console.log(event.date, now, event.future, event.hdate);
                    return event;
                }).reverse();

                console.log(self.events)
            }).catch(function (err) {
                // There was an error
                console.warn('Something went wrong.', err);
            });
        }
    },
    beforeMount: function () {
        this.getEvents();

    },
    updated: function () {

    },
    mounted: function () {
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

        this.headers.append("Content-Type", "application/json")
    }
});

