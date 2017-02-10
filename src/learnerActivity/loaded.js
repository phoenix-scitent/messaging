import R from 'ramda';
import * as most from 'most';
import classie from 'desandro-classie';
import { generateUUID } from './helpers.js';

var snabbdom = require('snabbdom');
var h = require('snabbdom/h').default;
var patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/attributes').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default
]);

import virtualize from 'snabbdom-virtualize';

// makeSnabbdomClasses('class1 class2 class3') === { class1: true, class2: true, class3: true }
var makeSnabbdomClasses = R.ifElse(R.either(R.isNil, R.isEmpty), R.always({}), R.compose(R.mergeAll, R.map(R.objOf(R.__, true)), R.split(' ')));

var loaded = function(learningElement){
  var { el, ref, sessionId, emitter, bus, data } = learningElement;

  var teardown$ = most.fromEvent(`teardown`, emitter).take(1);

  //////////
  // view //
  //////////

  var grabText = function(event){
    var value = event.target.value;
    emitter.emit('intent', { type: 'messageUpdate', context: { value } });
  };

  var message = function(model){
    var syncValue = (o, n) => n.elm.value = R.pathOr('', ['value'], model);

    return h('div', {}, [
      h('textarea', { class: { 'messaging-message': true }, hook: { update: syncValue }, on: { propertychange: grabText, change: grabText, click: grabText, keyup: grabText, input: grabText, paste: grabText } }, [
        //R.pathOr('', ['value'], model)
      ])
    ]);
  };

  var handleSubmit = function(event){
    emitter.emit('intent', { type: 'submit', context: { submitAt: Date.now() } });
  };

  var submit = function(model){
    return h('a', { class: { 'messaging-submit': true }, attrs: { style: 'cursor:pointer;' }, on: { click: handleSubmit } }, 'submit')
  };

  var wrapper = function(model, face, children){
    return h('div', { class: { 'messaging': true } }, [
      h('div', { class: { [`messaging-${face}`]: true } }, [
        JSON.stringify(model),
        ...children
      ])
    ]);
  };

  var front = function(model){
    return wrapper(model, 'front', [
      message(model),
      submit(model)
    ]);
  };

  var loading = function(model){
    var loaderHtml = R.pathOr(null, ['data', 'config', 'loader'], model);

    //console.log(virtualize(loaderHtml));

    if(loaderHtml){
      return wrapper(model, 'loading', [
        h('div', {}, '')
      ])
    } else {
      return wrapper(model, 'loading', [])
    }
  };

  var vdom = R.ifElse(
      R.anyPass([
        R.F
      ]),
      loading,
      front
  );

  ////////////////////
  // update machine //
  ////////////////////

  var modelSeed = { value: '', submitAt: null };

  var mountSeed = el.querySelector('.mount');

  var intentSeed = { type: 'init', context: {} };

  //TODO: make these streams? use scan to keep cache to check if update is needed?

  var nap = function(model){
    var shouldSubmit = R.pathSatisfies(R.compose(R.not, R.isNil), ['submitAt'], model);

    if(shouldSubmit){
      console.log();
      emitter.emit('intent', { type: 'flip', context: { face: 'back' } });
    }

  };

  var persist = function(model){
    var shouldSubmit = R.pathSatisfies(R.compose(R.not, R.isNil), ['submitAt'], model);
    var value = R.pathOr(null, ['value'], model);

    if(shouldSubmit){
      var body = R.pathOr('---', ['value'], model);
      var fromEmail = R.pathOr('---', ['context', 'user'], window);
      var course = R.pathOr('---', ['context', 'course'], window);
      var activity = R.pathOr('---', ['context', 'activity'], window);
      var section = R.pathOr('---', ['context', 'section'], window);

      emitter.emit('data::setMessage', { fromEmail, body, messageCreationPath: `${fromEmail}/${course}/${activity}/${section}` });
      emitter.emit('intent', { type: 'submit', context: { submitAt: null } }); //NOTE: in the assess lib action and present are updated to take single intent with multiple context vals
      emitter.emit('intent', { type: 'messageUpdate', context: { value: '' } });

      // TODO: is this the appropriate place for this?
      // TODO: should we not pass in FULL model?

      R.pathOr(() => {}, ['config', 'onSubmit'], model)(R.clone(model));

    }

  };

  var present = function(model, data) { // propose?

    return R.cond([ // can add validations and things with the current model...
      [R.has('value'), R.compose(R.assocPath(['value'], R.__, model), R.pathOr(null, ['value']))],
      [R.has('submitAt'), R.compose(R.assocPath(['submitAt'], R.__, model), R.pathOr(null, ['submitAt']))],
      [R.has('config'), R.compose(R.assocPath(['config'], R.__, model), R.pathOr({}, ['config']))],
      [R.T, R.always(model)]
    ])(data);

  };

  var action = function(intent){
    emitter.emit('internal', { type: 'action', context: { type: intent.type, context: JSON.stringify(intent.context) } });

    if(intent.type === 'data::getConfig'){
      return most.of(intent.context); // can also do processing...
    }

    if(intent.type === 'messageUpdate'){
      return most.of(intent.context); // can also do processing...
    }

    if(intent.type === 'submit'){
      return most.of(intent.context); // can also do processing...
    }

    return most.of({})
  };

  var model = modelSeed; //TODO: EH

  most.fromEvent('intent', emitter)
      .startWith(intentSeed)
      .flatMap(action)             // intent -> data
      .scan(present, modelSeed)    // data, model -> model
      .tap(persist)
      .tap((_model) => { model = _model; }) //TODO: EH
      .map(vdom)                  // model -> h
      .scan(patch, mountSeed) // mount, h -> h`
      .map(() => model) //TODO: EH
      .tap(nap)
      .takeUntil(teardown$)
      .drain();

  ////////////////////////
  // data communication //
  ////////////////////////

  // listen to changes and update remote persistance

  // figure out how to get initial subscribe data?
  //R.propOr({ observe: () => {} }, 'getConfig$', data).takeUntil(teardown$).observe( config => emitter.emit('intent', { type: 'data::getConfig', context: { config: config } }) );
  //R.propOr({ observe: () => {} }, 'getResponse$', data).takeUntil(teardown$).observe( response => emitter.emit('intent', { type: 'data::getResponse', context: { response: response } }) );
  //R.propOr({ observe: () => {} }, 'getResponses$', data).takeUntil(teardown$).observe( responses => emitter.emit('intent', { type: 'data::getResponses', context: { responses: responses } }) );

  R.propOr({ observe: () => {} }, 'getConfig$', data).takeUntil(teardown$).observe( config => emitter.emit('intent', { type: 'data::getConfig', context: { config: config } }) );

  var setMessage = function(message){
    var set = R.propOr(function(){}, 'setMessage', data);
    set(message);
  };

  most.fromEvent('data::setMessage', emitter)
      .tap(setMessage)
      .takeUntil(teardown$)
      .drain();

  ////////////////////////////
  // internal communication //
  ////////////////////////////

  const internal$ = most.fromEvent('internal', emitter)
      .takeUntil(teardown$);

  internal$
      .filter(R.propEq('type', 'action'))
    //.map(R.pick(''))
    //.tap(console.log)
      .drain();

  ///////////////////////
  // bus communication //
  ///////////////////////

  // listen and message between components, allowing for non-nested global communication
  // registration pattern (send out emitter || subject; reciver sends current state back then updates as needed) [MAKE SURE the stream or emitter has takeuntil teardown or unsubscribe... prefer subject then...]
  // lifecycle updates
  // commands for anyone listening (ex. stop all videos playing?)

  most.fromEvent('message', bus)
      .tap((message) => { emitter.emit('bus::getMessage', message) })
      .takeUntil(teardown$)
      .drain();

  // ex. meta.type === log... log all lifecyce events globally
  most.fromEvent('bus::sendMessage', emitter)
      .tap(({ type }) => { bus.emit('message', { meta: { type: type }, identity: { type: 'poll', id: sessionId }, data: {} }) })
      .takeUntil(teardown$)
      .drain();

  //TODO: 'bus registration pattern' [register with activity] send emitter to activity for it to emit messages back || send 'subject' to push onto stream here... on activity events store to model? activity when recieve, hooks up and sends current state then each preceeding state

  //////////////
  // teardown //
  //////////////

  // mutationobserver
  // emitter.emit('teardown')

};

module.exports = {
  loaded
};