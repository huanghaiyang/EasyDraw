import { createI18n } from "vue-i18n";

const i18n = createI18n({
  legacy: false,
  locale: "zh",
  messages: {}
});

async function loadLocaleMessages() {
  const modules = import.meta.glob('./locales/*.json');

  for (const path in modules) {
    const locale = path.match(/\/([A-Za-z0-9-_]+)\.json$/)[1];
    modules[path]().then((module: { default: Record<string, any> }) => {
      i18n.global.setLocaleMessage(locale, module.default);
    });
  }
}

loadLocaleMessages()

export default i18n;