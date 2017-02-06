const most = require('most');
const R = require('ramda');
const firebase = require('firebase');
const fbconfig = require('../fbconfig');

firebase.initializeApp(fbconfig);

const instructorEmail = window.current_instructor_email;

const messages = firebase.database().ref('messages');

const mostRefEvent = (ref, evt) => {
  return most.fromEvent(evt, {
    addListener: (type, listener) => ref.on(type, listener),
    removeListener: (type, listener) => ref.off(type, listener)
  })
};

//TODO: remove on remove?
//TODO: update on update?

// 'child_added'
// 'child_removed'
// 'child_updated'

const userMessages = (email) => mostRefEvent(messages.orderByChild('').equalTo(email), 'value') //.map(R.nth(0));

const message$ = userMessages(userEmail);

const messagesToHtml = R.compose(
    R.join(''),
    R.map((message) => { return `<li>${message.body}</li>` }),
    R.values
);

const render = (messagesHtml) => {
  //console.log(messagesHtml);
  document.getElementById('questions').innerHTML = messagesHtml;
};

message$
  //.tap(console.log)
    .map((snap) => { return snap.val() })
  //.tap(console.log)
  //.scan((messages, message) => { return R.append(message, messages) }, [])
    .map(messagesToHtml)
    .tap(render)
    .drain();