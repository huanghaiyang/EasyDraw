export default class EventUtils {
  static stopPP(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }
}
