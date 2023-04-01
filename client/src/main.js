import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Ping from './components/Ping.vue';

const routes = [
    {
        path: '/ping',
        name: 'Ping',
        component: Ping,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

createApp(App)
.use(router)
.mount('#app');
