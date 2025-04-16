import { createApp } from "vue";
import { createPinia } from "pinia";
import "normalize.css";
import "@/style.css";
import "@/assets/iconfont/iconfont.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "@/App.vue";
import i18n from "@/i18n";
import FontLoader from "@/utils/FontLoader";
import { FontFamilyList } from "@/styles/ElementStyles";
import CanvasUtils from "@/utils/CanvasUtils";
import RotateSvg from "@/assets/svg/rotate.svg";
import ResizeV from "@/assets/svg/resize-v.svg";
import CrossSvg from "@/assets/svg/cross_.svg";
import HandSvg from "@/assets/svg/hand.svg";

FontLoader.batchLoadFonts(FontFamilyList);
CanvasUtils.cacheStringImages([RotateSvg, ResizeV, CrossSvg, HandSvg]);

const app = createApp(App);
const pinia = createPinia();

app.use(ElementPlus, {
  size: "small",
});
app.use(pinia);
app.use(i18n);
app.mount("#app");
