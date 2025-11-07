import { createApp } from 'vue';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import Menubar from 'primevue/menubar';
import Panel from 'primevue/panel';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import Carousel from 'primevue/carousel';
import Textarea from 'primevue/textarea';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';

import router from '@/router';
import App from './App.vue';
import './style.css';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
});

app.use(ToastService);
app.use(ConfirmationService);

app.component('PvButton', Button);
app.component('PvCard', Card);
app.component('PvDivider', Divider);
app.component('PvInputText', InputText);
app.component('PvMenubar', Menubar);
app.component('PvPanel', Panel);
app.component('PvTag', Tag);
app.component('PvToast', Toast);
app.component('PvConfirmDialog', ConfirmDialog);
app.component('PvDialog', Dialog);
app.component('PvPassword', Password);
app.component('PvCarousel', Carousel);
app.component('PvTextarea', Textarea);
app.component('PvDataTable', DataTable);
app.component('PvColumn', Column);
app.component('PvDropdown', Dropdown);

app.mount('#app');
