const API_URL = window.location.protocol === 'file:' ? 'http://localhost:8000' : 'https://below.black';

Vue.component('carousel', {
    props: ['n', 'src', 'title', 'credit'],
    data() {
        return {
            img: [],
            current: '',
            i: 0
        };
    },
    template: `
        <div class="carousel-wrapper">
            <div class="carousel">
                <img :src="current" />
                <div v-if="credit" class="overlay">
                    <p>{{ title }}</p>
                    <p>&copy; {{ credit }}</p>
                </div>
            </div>
        </div>
    `,
    mounted() {
        for (let i = 0; i < this.n; i++) {
            this.img.push(`./media/carousel/${this.src}/${i}.jpg`);
        }
        this.current = this.img[this.i];
        this.i = (this.i + 1) % this.n;
        setInterval(() => {
            this.current = this.img[this.i];
            this.i = (this.i + 1) % this.n;
        }, 1500 + Math.floor(Math.random() * 2000));
    }
});

Vue.component('sceno', {
    props: ['n', 'src', 'title', 'credit'],
    template: `
        <div>
            <div class="sceno-title">
                <p>{{ title }}</p>
                <p v-if="credit">&copy; {{ credit }}</p>
            </div>
            <div class="sceno-img-wrapper" v-for="img in imgs" :key="img">
                <img :src="img" />
            </div>
        </div>
    `,
    data() {
        return {
            imgs: []
        };
    },
    mounted() {
        for (let i = 0; i < this.n; i++) {
            this.imgs.push(`./media/carousel/${this.src}/${i}.jpg`);
        }
        console.log(this.imgs);
    }
});

Vue.component('vj', {
    props: ['n'],
    template: `
        <div>
            <div class="vj-img-wrapper" v-for="img in imgs" :key="img">
                <img :src="img" />
            </div>
        </div>
    `,
    data() {
        return {
            imgs: []
        };
    },
    mounted() {
        for (let i = 0; i < this.n; i++) {
            this.imgs.push(`./media/vj/${i}.jpg`);
        }
        console.log(this.imgs);
    }
});

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

const now = new Date().getTime();
let futureFlag = false;
let nextEvent = null;

new Vue({
    el: '#app-below',
    data: {
        currentSection: window.location.hash ? window.location.hash.substr(1) : 'home',
        events: [],
        vj: [],
        sceno: [],
        nextEvent: nextEvent,
        newLines: true
    },
    computed: {
        availableTags() {
            const tagsF = {};
            this.posts.forEach(post => {
                post.tags.forEach(tag => {
                    tagsF[tag] = (tagsF[tag] || 0) + 1;
                });
            });
            return Object.keys(tagsF)
                .map(tag => ({ value: tag }))
                .sort((a, b) => tagsF[b.value] - tagsF[a.value])
                .slice(0, 42);
        }
    },
    methods: {
        load(section) {
            console.log(section);
            this.currentSection = section;
            this.animateLines();
        },
        animateLines() {
            if (this.currentSection === 'home') {
                document.getElementById("c").style.display = "block";
                this.newLines = true;
            } else {
                this.newLines = false;
            }
        },
        getEvents() {
            fetch(`${API_URL}/api/events`)
                .then(response => response.json())
                .then(data => {
                    this.events = data.map(event => {
                        const [month, day, year] = event.date.split(' ');
                        event.hdate = `${day} ${humanMonth[parseInt(month)]} ${year}`;
                        event.date = Date.parse(`${day} ${month} ${year}`);
                        event.future = (event.date > now);
                        if (event.future && !futureFlag) {
                            this.nextEvent = event;
                            futureFlag = true;
                        }
                        return event;
                    }).reverse();
                })
                .catch(err => console.warn('Something went wrong.', err));
        },
        getVJ() {
            fetch(`${API_URL}/api/vj`)
                .then(response => response.json())
                .then(data => this.vj = data)
                .catch(err => console.warn('Something went wrong.', err));
        },
        getSceno() {
            fetch(`${API_URL}/api/sceno`)
                .then(response => response.json())
                .then(data => this.sceno = data)
                .catch(err => console.warn('Something went wrong.', err));
        }
    },
    beforeMount() {
        this.getEvents();
        this.getVJ();
        this.getSceno();
    },
    mounted() {
        document.getElementById("c").style.display = "block";
        document.body.style.filter = "invert(1)";

        setTimeout(() => {
            document.body.style.filter = "";
            document.getElementById("logo-loader").style.display = "none";
            document.getElementById("app-below").style.display = "block";
            this.animateLines();
            setTimeout(() => {
                this.newLines = false;
            }, 2500);
        }, 2500);

        const param = 'fbclid';
        if (location.search.includes(`${param}=`)) {
            let replace;
            try {
                const url = new URL(location);
                url.searchParams.delete(param);
                replace = url.href;
            } catch (ex) {
                const regExp = new RegExp(`[?&]${param}=.*$`);
                replace = location.search.replace(regExp, '');
                replace = location.pathname + replace + location.hash;
            }
            history.replaceState(null, '', replace);
        }
    }
});
