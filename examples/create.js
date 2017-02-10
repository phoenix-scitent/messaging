/*

  node ./examples/create.js

*/

const most = require('most');
const R = require('ramda');
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

const instructorEmail = 'instructor@instructor.com';
const userEmail = 'user@user.com';

const messages = firebase.database().ref('messages');
const users = firebase.database().ref('users');

//users.push({
//  email: 'user@user.com'
//})

const createFakeMessage = () => {
  var message = {
    to: null,
    from: userEmail,
    body: '9 bill, millis',
    timestamp: Date.now(),
    responses: [
      {
        to: userEmail,
        from: instructorEmail,
        body: 'here is a response!',
        timestamp: Date.now(),
        responses: []
      },
      {
        to: userEmail,
        from: instructorEmail,
        body: 'here is another response!',
        timestamp: Date.now(),
        responses: [
          {
            to: instructorEmail,
            from: userEmail,
            body: 'here is a response to a response!',
            timestamp: Date.now(),
            responses: []
          }
        ]
      }
    ]
  };

  messages.push(message);

  console.log(message);
};

most.periodic(2000).forEach(createFakeMessage);