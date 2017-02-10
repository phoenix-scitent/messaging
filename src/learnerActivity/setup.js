import R from 'ramda';
import * as most from 'most';
import { learningElement$ } from 'watcher';
import { makeEmitter, bus } from 'partybus';
import { generateUUID } from './helpers.js';
import { dataSetup } from './data.js';
import { loaded } from './loaded.js';

const configureMessaging = function(fbconfig, configuration = {}, testData = {}){

  learningElement$
      .filter(el => el.getAttribute('learning-element') === 'messaging')
      .tap(el => el.innerHTML = '<div class="mount"></div>' )
      .map(function(el){
        const sessionId = generateUUID({ prefix: 'messaging-session' });
        const emitter = makeEmitter();
        const ref = el.getAttribute('learning-element-ref');
        const options = R.unless(R.isNil, JSON.parse)(el.getAttribute('learning-element-options'));
        const config = configuration;
        const data = dataSetup({ sessionId, ref, options, config, fbconfig });

        //TODO: best way to make decisions here using data?

        return { el, ref, sessionId, emitter, bus, data };
      })
      .tap(loaded)
      .drain();

};

export { configureMessaging };