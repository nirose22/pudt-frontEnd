import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'


import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css'
import Button from 'primevue/button';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import InputText from 'primevue/inputtext';
import { MyPreset } from './theme/preset'
import './assets/styles/fonts.css'
import './assets/main.css'

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
        order: 'theme, base, components, utilities, keyframes'
    }
})

app.use(createPinia())
app.use(router)

app.use(ToastService);
app.use(ConfirmationService);
app.component('Button', Button);
app.component('InputText', InputText);

app.mount('#app')

