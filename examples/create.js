/*

  node ./examples/create.js

*/

const most = require('most');
const R = require('ramda');
const firebase = require('firebase');
const fbconfig = require('../src/fbconfig');

firebase.initializeApp(fbconfig);

const instructorEmail = 'instructor@instructor.com';
const userEmail = 'user@user.com';

const messages = firebase.database().ref('messages');
const users = firebase.database().ref('users');

//users.push({
//  email: 'user@user.com'
//})

const createFakeMessage = () => {
  messages.push({
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
  })
};

most.periodic(2000).forEach(createFakeMessage);