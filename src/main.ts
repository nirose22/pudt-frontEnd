import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css';
import './assets/styles/fonts.css'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import piniaPersist from 'pinia-plugin-persistedstate'

import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import InputText from 'primevue/inputtext';
import { MyPreset } from '@/theme/preset'
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import Tooltip from 'primevue/tooltip';

const app = createApp(App)

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: false,
        }
    },
    cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue'
    }
})

const pinia = createPinia()
pinia.use(piniaPersist)   // 全域註冊
app.use(pinia)
app.use(router);

app.use(ToastService);
app.use(ConfirmationService);
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Toast', Toast);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Dialog', Dialog);
app.directive('tooltip', Tooltip);
app.mount('#app')

