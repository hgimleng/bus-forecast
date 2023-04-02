import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Ping from './components/Ping.vue';
import BusSearch from './components/BusSearch.vue';
import 'bootstrap/dist/css/bootstrap.css';

const routes = [
    {
        path: '/ping',
        name: 'Ping',
        component: Ping,
    },
    {
        path: '/bus',
        name: 'Bus',
        component: BusSearch,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App)
.use(router)
.mount('#app');
