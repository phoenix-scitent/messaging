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

const instructorEmail = window.current_user_email;

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

const unanswered$ = mostRefEvent(messages.orderByChild('responses').endAt(null), 'value');
const answered$ = mostRefEvent(messages.orderByChild('responses').startAt(""), 'value');

//////////////////
// add response //
//////////////////

const createResponse = (response) => ({
  from: instructorEmail,
  timestamp: Date.now(),
  body: response,
  messageCreationPath: `${instructorEmail}/instructorPage`
});

const persistMessage = context => {
  messages.child(context.id).child('responses').push(createResponse(context.response));
};

most.fromEvent('click', document.querySelector('body'))
  .filter((event) => { return event.target.classList.contains('respond') })
  .map((event) => { return { id: event.target.dataset.messageId, response: event.target.previousSibling.previousSibling.value } })
  .tap(persistMessage)
  .drain();

////////////////
// unanswered //
////////////////

const unansweredToHtml = (message, id) => {
  return `<li>
    <div class='message-body'>${message.body}</div>
    <div class='message-from'>${message.from}</div>
    <div class='message-timestamp'>${moment(message.timestamp).format('MMMM Do YYYY h:mm a')}</div>
    <div data-message-id="${id}" class='message-responses'>
      <textarea class="response-text"></textarea>
      <button data-message-id="${id}" class="respond">Respond</button>
    </div>
  </li>`
};

const unansweredsToHtml = R.compose(
  R.join(''),
  // least recent first
  R.values,
  R.mapObjIndexed(unansweredToHtml)
);

const renderUnanswered = (messagesHtml) => {
  //console.log(messagesHtml);
  document.getElementById('unanswered').innerHTML = messagesHtml;
};

unanswered$
  //.tap(console.log)
  .map((snap) => { return snap.val() })
  //.tap(console.log)
  //.scan((messages, message) => { return R.append(message, messages) }, [])
  .map(unansweredsToHtml)
  .tap(renderUnanswered)
  .drain();

//////////////
// answered //
//////////////

const responseToHtml = (response, id) => {
  return `<li>
    <div class='response-body'>${response.body}</div>
    <div class='response-from'>${response.from}</div>
    <div class='response-timestamp'>${moment(response.timestamp).format('MMMM Do YYYY h:mm a')}</div>
  </li>`
};

const responsesToHtml = R.compose(
    R.join(''),
    R.reverse, // most recent first
    R.values,
    R.mapObjIndexed(responseToHtml)
);

const answeredToHtml = (message, id) => {
  return `<li>
    <div class='message-body'>${message.body}</div>
    <div class='message-from'>${message.from}</div>
    <div class='message-timestamp'>${moment(message.timestamp).format('MMMM Do YYYY h:mm a')}</div>
    <div data-message-id="${id}" class='message-responses'>
      <ul>${responsesToHtml(R.pathOr([], ['responses'], message))}</ul>
    </div>
  </li>`
};

const answeredsToHtml = R.compose(
    R.join(''),
    R.reverse, // most recent first
    R.values,
    R.mapObjIndexed(answeredToHtml)
);

const renderAnswered = (messagesHtml) => {
  //console.log(messagesHtml);
  document.getElementById('answered').innerHTML = messagesHtml;
};

answered$
  //.tap(console.log)
  .map((snap) => { return snap.val() })
  //.tap(console.log)
  //.scan((messages, message) => { return R.append(message, messages) }, [])
  .map(answeredsToHtml)
  .tap(renderAnswered)
  .drain();