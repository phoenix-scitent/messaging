import { configureMessaging } from './src/learnerActivity/setup';

////////////////////////////////////////////////////
// FIREBASE CONFIG: passed in from activity level //
////////////////////////////////////////////////////

var fbconfig = {
  apiKey: "AIzaSyC6GvFxYBy8LIaojxyDHPfIu1_LYbW6STA",
  authDomain: "scitent-test-80e67.firebaseapp.com",
  databaseURL: "https://scitent-test-80e67.firebaseio.com",
  storageBucket: "scitent-test-80e67.appspot.com",
  messagingSenderId: "912116787242"
};

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className);
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className);
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className=el.className.replace(reg, ' ')
  }
}

function toggle_visibility(e) {
  if(e.style.display == 'block')
    e.style.display = 'none';
  else
    e.style.display = 'block';
}

//////////////////////
//////////////////////

// SHOW HIDE \\

document.getElementById('toggle-messaging').onclick = function(event) {
  toggle_visibility(document.getElementsByClassName('messaging')[0]);
};

// GLOBAL CONFIG \\

const allMessaging = {
  // universal defaults
  onSubmit: () => {
    alert('Thanks for submitting, check this page for a response!')
    toggle_visibility(document.getElementsByClassName('messaging')[0]);
  }
};

///////////
// SETUP //
///////////

configureMessaging(fbconfig, allMessaging);