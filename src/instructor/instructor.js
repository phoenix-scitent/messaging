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

const unanswered$ = mostRefEvent(messages.orderByChild('responses').endAt(null), 'value');
const answered$ = mostRefEvent(messages.orderByChild('responses').startAt(""), 'value');

//////////////////
// add response //
//////////////////

const createResponse = (from, response) => ({
  to: from,
  from: instructorEmail,
  timestamp: Date.now(),
  body: response
});

const persistMessage = context => {
  messages.child(context.id).child('responses').push(createResponse(context.from, context.response));
};

most.fromEvent('click', document.querySelector('body'))
  .filter((event) => { return event.target.classList.contains('respond') })
  .map((event) => { return { id: event.target.dataset.messageId, from: event.target.dataset.messageFrom, response: event.target.previousSibling.previousSibling.value } })
  .tap(persistMessage)
  .drain();

////////////////
// unanswered //
////////////////

const unansweredToHtml = (message, id) => {
  return `<li>
    <div class='message-body'>${message.body}</div>
    <div data-message-id="${id}" class='message-responses'>
      <textarea class="response-text"></textarea>
      <button data-message-id="${id}" data-message-from="${message.from}" class="respond">Respond</button>
    </div>
  </li>`
};

const unansweredsToHtml = R.compose(
  R.join(''),
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
    <div class='response-from'>From: ${response.from}</div>
  </li>`
};

const responsesToHtml = R.compose(
    R.join(''),
    R.values,
    R.mapObjIndexed(responseToHtml)
);

const answeredToHtml = (message, id) => {
  return `<li>
    <div class='message-body'>${message.body}</div>
    <div data-message-id="${id}" class='message-responses'>
      <ul>${responsesToHtml(R.pathOr([], ['responses'], message))}</ul>
    </div>
  </li>`
};

const answeredsToHtml = R.compose(
    R.join(''),
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