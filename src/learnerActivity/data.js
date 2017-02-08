// firebase
// tincan
// localstore
import R from 'ramda';
import * as most from 'most';

import firebase from 'firebase';
import fbconfig from '../fbconfig.js';

firebase.initializeApp(fbconfig);

var dataSetup = function({ sessionId, ref, options, config, testData }){
  //TODO: get active data sources from index/config? get the init for them as well?
  //TODO: activity is structured like this as well... can communicate through bus (ex. current section, user, etc...)... has its own data set/get with completion etc...
  //TODO: events on initial setup for all -- multicast/behaviorsubject/etc activity to send last? OR send message to activity with stream and it will register it (have teardown setup)

  // fake data implementation
  // localstorage implementation
  // tincan implementation
  // firebase implementation

  // TODO: add this to readme and code in...
  // ORDER OF IMPORTANCE FOR SETUP DATA
  // 1. [options] attrs (*preferred*) <index.html, setup.js, data.js>
  // 2. [config] hooks (`config` function that takes object sent back from import of this library, merged in) [only place you can add functions] <config.js, setup.js, data.js>
  // 3. persisted data <setup.js, data.js>
  // 4. defaults in code <setup.js>

  ////////////
  // tincan //
  ////////////

  // reactive tincan... on set callback, trigger get (most.fromPromise ajax?)

  //////////////
  // firebase //
  //////////////

  const messages = firebase.database().ref('messages');

  var setMessage = function({ fromEmail, body, messageCreationPath }){

    var message = {
      from: fromEmail,
      timestamp: Date.now(),
      body,
      messageCreationPath
    };

    messages.push(message)
  };

  /////////////////////
  // data access api //
  /////////////////////

  // decorate with activity info first for search? or add this in loaded.js?

  return {
    setMessage
  };

};

module.exports = {
  dataSetup
};
