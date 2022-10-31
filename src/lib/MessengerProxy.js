export default class MessengerProxy {
  #messenger = null;

  constructor() {
    if (MessengerProxy.singleton) {
      const singleton = MessengerProxy.singleton;
      return singleton;
    }
    MessengerProxy.singleton = this;
    return MessengerProxy.singleton;
  }

  get messenger() {
    return this.#messenger;
  }
  
  set messenger(obj) {
    if (obj) this.#messenger = obj;
  }
}
