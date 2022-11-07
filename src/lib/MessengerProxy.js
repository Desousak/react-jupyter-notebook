// A singleton proxy for the messenger
// Forwards function refs to the messenger
export default class MessengerProxy {
  bruh = undefined;

  constructor() {
    if (MessengerProxy.singleton) {
      const singleton = MessengerProxy.singleton;
      return singleton;
    }
    MessengerProxy.singleton = this;
    return MessengerProxy.singleton;
  }

  set messenger(obj) {
    if (obj) {
      // Signal class removal
      let promise = this.deconstructor
        ? this.deconstructor()
        : Promise.resolve();
        
      promise.then(() => {
        this.messengerObj = obj;

        // Get public functions from the object
        const methodNames = new Set();
        while ((obj = Reflect.getPrototypeOf(obj))) {
          let keys = Reflect.ownKeys(obj);
          keys.forEach((k) => methodNames.add(k));
        }

        // Create a reference to them from this class
        for (let key of methodNames) {
          if (key !== 'constructor' && !key.includes('_')) {
            MessengerProxy.singleton.constructor.prototype[key] = (...args) =>
              this.messengerObj[key](...args);
          }
        }
      });
    }
  }
}
