const most = require('most');
const R = require('ramda');
const EventEmitter = require('events');
const firebase = require('firebase');
const fbconfig = require('../fbconfig');

firebase.initializeApp(fbconfig);

const userEmail = 'user@user.com'; //window.current_user_email;

const messages = firebase.database().ref('messages');
const users = firebase.database().ref('users');

//users.push({
//  email: 'user@user.com'
//})

const createFakeMessage = () => {
  messages.push({
    parentId: null,
    from: userEmail,
    body: 'What is the meaning of the universe? Testes?',
    timestamp: Date.now()
  })
};

//most.periodic(2000).forEach(createFakeMessage);

//users.orderByChild('email').equalTo(userEmail).on('child_added', function(snap, 324){
//  console.log(snap.key)
//});

const mostRefEvent = (ref, evt) => {
  return most.fromEvent(evt, {
    addListener: (type, listener) => ref.on(type, listener),
    removeListener: (type, listener) => ref.off(type, listener)
  })
};

//const mostRefEvent = (ref, evt) => {
//  const emitter = new EventEmitter();
//  ref.on(evt, (snap) => emitter.emit(evt, snap)); // memory leak? how to unsubscribe?
//  return most.fromEvent(evt, emitter);
//};

//const emitter = new EventEmitter();
//
//messages.orderByChild('from').equalTo(userEmail).on('child_added', (snap) => { emitter.emit('here', snap) });
//
//var message$ = most.fromEvent('here', emitter);

const userMessages = (email) => mostRefEvent(messages.orderByChild('from').equalTo(email), 'child_added').map(R.nth(0));

const message$ = userMessages(userEmail);

const messagesToHtml = R.compose(
    R.join(''),
    R.map((message) => { return `<li>${message.body}</li>` })
);

const render = (messagesHtml) => {
  console.log(messagesHtml);
  document.getElementById('questions').innerHTML = messagesHtml;
};

message$
  //.tap(console.log)
  .map((snap) => { return snap.val() })
  //.tap(console.log)
  .scan((messages, message) => { return R.append(message, messages) }, [])
  .map(messagesToHtml)
  .tap(render)
  .drain();