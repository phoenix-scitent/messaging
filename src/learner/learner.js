const most = require('most');
const R = require('ramda');
const moment = require('moment');
const firebase = require('firebase');

// TODO: how to abstract this out?

var fbconfig = {
  apiKey: "AIzaSyC6GvFxYBy8LIaojxyDHPfIu1_LYbW6STA",
  authDomain: "scitent-test-80e67.firebaseapp.com",
  databaseURL: "https://scitent-test-80e67.firebaseio.com",
  storageBucket: "scitent-test-80e67.appspot.com",
  messagingSenderId: "912116787242"
};

firebase.initializeApp(fbconfig);

const userEmail = window.current_user_email;

const messages = firebase.database().ref('messages');

const mostRefEvent = (ref, evt) => {
  return most.fromEvent(evt, {
    addListener: (type, listener) => ref.on(type, listener),
    removeListener: (type, listener) => ref.off(type, listener)
  })
};

/////////////////////
// add new message //
/////////////////////

//TODO: eventual selector: note for me, for instructor conversation, for all learners conversation

var messageText = document.querySelector('#input_1_2');
var submitButton = document.querySelector('#gform_submit_button_1');

const createMessage = body => ({
  from: userEmail,
  timestamp: Date.now(),
  body: body,
  messageCreationPath: `${userEmail}/learnerPage`
});

const persistMessage = message => {
  messages.push(message);
};

most.fromEvent('click', submitButton)
  .tap((event) => { event.preventDefault() })
  .map((event) => { return messageText.value })
  .map(createMessage)
  .tap(persistMessage)
  .tap(() => { messageText.value = '' })
  .drain();

/////////////////////////////////
// show messages and responses //
/////////////////////////////////

// TODO: refactor?
// 'child_added'
// 'child_removed'
// 'child_updated'

const userMessages = (email) => mostRefEvent(messages.orderByChild('from').equalTo(email), 'value') //.map(R.nth(0));

const message$ = userMessages(userEmail);

const responseToHtml = (response, id) => {
  return `<li>
    <div class='response-body'>${response.body}</div>
    <div class='response-from'>${response.from}</div>
    <div class='response-timestamp'>${moment(response.timestamp).format('MMMM Do YYYY h:mm a')}</div>
  </li>`
};

const responsesToHtml = R.compose(
  //TODO: recursive nesting or tagged connection single line for each?
  //TODO: UI and persistance behavior to respond to responses
  R.join(''),
  R.reverse, // most recent first
  R.values,
  R.mapObjIndexed(responseToHtml)
);

const emptyObj = {};

const messageToHtml = (message, id) => {
  return `<li data-message-id="${id}">
    <div class="message-body">${message.body}</div>
    <div class="message-responses">
      <ul>${responsesToHtml(R.pathOr(emptyObj, ['responses'], message))}</ul>
    </div>
  </li>`
};

const messagesToHtml = R.compose(
  R.join(''),
  R.reverse, // most recent first
  R.values,
  R.mapObjIndexed(messageToHtml)
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