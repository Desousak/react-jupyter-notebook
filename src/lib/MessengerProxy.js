var messengerProxy = null;
var buildMessengerProxy = (messenger) => {
  console.log('Updating messenger...');
  messengerProxy = new messenger();
};

export { messengerProxy as default, buildMessengerProxy };
