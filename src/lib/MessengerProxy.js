var messengerProxy = null;
var buildMessengerProxy = (messenger) => {
  messengerProxy = new messenger();
};

export { messengerProxy, buildMessengerProxy };
