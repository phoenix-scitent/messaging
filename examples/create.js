/*

  node ./examples/create.js

*/

const most = require('most');
const R = require('ramda');
const firebase = require('firebase');
const fbconfig = require('../src/fbconfig');

firebase.initializeApp(fbconfig);

const userEmail = 'user@user.com';

const messages = firebase.database().ref('messages');
const users = firebase.database().ref('users');

//users.push({
//  email: 'user@user.com'
//})

const createFakeMessage = () => {
  messages.push({
    parentId: null,
    from: userEmail,
    body: '9 bill, millis',
    timestamp: Date.now()
  })
};

most.periodic(2000).forEach(createFakeMessage);