import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import Card from "primevue/card";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import DataView from "primevue/dataview";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import "primeicons/primeicons.css";
import './style.css'
import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ConfirmationService);
app.use(ToastService);

app.component("Card", Card);
app.component("Button", Button);
app.component("InputNumber", InputNumber);
app.component("DataView", DataView);
app.component("ConfirmDialog", ConfirmDialog);
app.component("Toast", Toast);

app.mount("#app");
