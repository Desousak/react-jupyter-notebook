var messengerProxy = null;

var buildMessengerProxy = (messenger) => {
  messengerProxy = messenger;
};

export { messengerProxy as default, buildMessengerProxy };
