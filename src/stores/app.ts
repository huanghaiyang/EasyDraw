import axios from "axios";
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    name: "app",
    locale: "zh",
    version: "1.0.0",
    user: {},
    token: "",
    config: {},
    menu: {},
    isMobile: false,
    isLandscape: false,
    isFullScreen: false,
    isShowSidebar: true,
    isShowHeader: true,
    isShowFooter: true,
  }),
  actions: {
    async init() {
      const res = await Promise.all([
        this.getLocale(),
        this.getUserInfo(),
        this.getVersion(),
        this.getConfig(),
      ]);
      const [locale, user, version, config] = res;
      this.locale = locale.data;
      this.user = user.data;
      this.version = version.data;
      this.config = config.data;
    },
    async getLocale() {
      return "zh";
      const res = await axios.get("/api/locale");
      return res;
    },
    async getUserInfo() {
      const res = await axios.get("/api/user");
      return res;
    },
    async getVersion() {
      const res = await axios.get("/api/version");
      return res;
    },
    async getConfig() {
      const res = await axios.get("/api/config");
      return res;
    },
    async getUploadToken() {
      const res = await axios.get("/api/upload/token");
      return res;
    },
    async getUploadUrl() {
      const res = await axios.get("/api/upload/url");
      return res;
    },
    async getUploadFileInfo(params: any) {
      const res = await axios.get("/api/upload/file", params);
      return res;
    },
    async getUploadFileList(params: any) {
      const res = await axios.get("/api/upload/list", params);
      return res;
    },
  },
});
