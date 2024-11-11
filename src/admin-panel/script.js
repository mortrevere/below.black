const API_URL = window.location.protocol === 'file:' ? 'http://localhost:8000' : 'https://below.black';

const humanMonth = {
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
};

new Vue({
    el: '#app-admin-below',
    data: {
        currentSection: window.location.hash ? window.location.hash.substr(1) : 'events',
        events: [],
        event: { year: "2024" },
        creds: {},
        token: "",
        headers: new Headers({ "Content-Type": "application/json" })
    },
    methods: {
        load(section) {
            console.log(section);
            this.currentSection = section;
            if (section === 'vinyl') window.location.hash = section;
        },
        addEvent() {
            if (!confirm("T'es sûr frère ?\n\n" + JSON.stringify(this.event))) return;

            fetch(`${API_URL}/api/event`, {
                method: 'PUT',
                mode: 'cors',
                headers: this.headers,
                body: JSON.stringify(this.event)
            })
                .then(response => alert("C'est bon"))
                .then(() => this.getEvents())
                .catch(() => alert('ça a foiré'));
        },
        login() {
            fetch(`${API_URL}/api/auth`, {
                method: 'POST',
                mode: 'cors',
                headers: this.headers,
                body: JSON.stringify(this.creds)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.token) {
                        console.log(data.token);
                        this.token = data.token;
                        this.headers.set("token", data.token);
                    }
                })
                .catch(() => alert("ça a foiré, t'es qui fdp ?"));
        },
        deleteEvent(event) {
            if (!confirm("T'es sûr.e ?")) return;
            if (!confirm("T'es VRAIMENT sûr.e ? Sinon je te monte en l'air\n\n" + JSON.stringify(event))) return;

            const [month, day, year] = event.date.split(" ");
            Object.assign(event, { year, month, day });

            fetch(`${API_URL}/api/event`, {
                method: 'DELETE',
                mode: 'cors',
                headers: this.headers,
                body: JSON.stringify(event)
            })
                .then(response => alert("C'est bon c'est supprimé"))
                .then(() => this.getEvents())
                .catch(() => alert('déso ça a foiré'));
        },
        getEvents() {
            fetch(`${API_URL}/api/events`, { headers: this.headers })
                .then(response => response.json())
                .then(data => {
                    this.events = data.map(event => {
                        const chunks = event.date.split(' ');
                        event.hdate = chunks.map((c, i) => (i == 1 ? humanMonth[parseInt(c)] : c)).join(' ');
                        event.date = [chunks[1], chunks[0], chunks[2]].join(' ');
                        return event;
                    }).reverse();
                })
                .catch(err => console.warn('Something went wrong.', err));
        }
    },
    beforeMount() {
        this.getEvents();
    },
    mounted() {
        const param = 'fbclid';
        if (location.search.includes(param + '=')) {
            const url = new URL(location);

            url.searchParams.delete(param);

            history.replaceState(null, '', url.href);
        }
    }
});
