// A singleton proxy for the messenger
// Forwards function refs to the messenger 
export default class MessengerProxy {
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
      // Get public functions from the object
      const methodNames = Object.getOwnPropertyNames(obj.constructor.prototype);

      // Create a reference to them from this class
      for (let key of methodNames) {
        if (key !== 'constructor')
          MessengerProxy.singleton.constructor.prototype[key] = (...args) =>
            obj[key](...args);
      }
    }
  }
}
