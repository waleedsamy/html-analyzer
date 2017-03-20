'use strict';
var when = require('when'),
    cheerio = require('cheerio');


let SIGNIN_FORM_MAY_HAVE = /(log in|login|sign in|signin)/ig,
    SIGNUP_FORM_MAY_HAVE = /(register|sign up|signup|join)/ig;


/**
 * [detect if form is signin or signup one]
 *  sign in form:
 *   probably contains one input[password] and two others of type text and submit
 *   finding SIGNIN_FORM_MAY_HAVE in the form content increase the weight
 *  sign up form:
 *   probably contain one+ input[password] and three+ regular input
 *   finding SIGNUP_FORM_MAY_HAVE in the form content increase the weight
 *
 * @param  {[integer]} i    [index used to track the tested form]
 * @param  {[string]} html [actuall html content of the form]
 * @return {[promise]}      [resolved with detected information about the form]
 * detected information:
 *  id: form id
 *  input: total number of inputs
 *  password_input: total number of input[type=password]
 *  hidden_input: total number of input[type=hidden]
 *  regular_input_count: total number of input which is neither password nor hidden
 *  signin_weight: number represent a wight of how likly this form is signin one
 *  signup_weight: number represent a wight of how likly this form is signup one
 *  signinForm: boolean, tell if form is signin form, based on the bigger value of signin_weight
 *  signupForm: boolean, tell if form is signup form, based on the bigger value of signup_weight
 */
function detect(i, html) {
    let signin_weight = 1;
    let signup_weight = 1;

    let signin_match = html.match(SIGNIN_FORM_MAY_HAVE);
    let signup_match = html.match(SIGNUP_FORM_MAY_HAVE);

    if (signin_match) {
        signin_weight = signin_match.length * 10;
    }

    if (signup_match) {
        signup_weight = signup_match.length * 10;
    }

    let $$ = cheerio.load(html);

    let inputs = $$('input').length;
    let password_input = $$('input[type=password]').length;
    let hidden_input = $$('input[type=hidden]').length;
    let regular_input_count = inputs - (password_input + hidden_input);

    if (password_input > 1) {
        signup_weight *= 100;
    } else {
        // signup should contain three+ regular input (text/password/submit)
        if (regular_input_count > 3) {
            signup_weight *= regular_input_count;
        } else {
            signin_weight *= regular_input_count;
        }
    }

    let guess = {
        id: i,
        input: inputs,
        password_input: password_input,
        hidden_input: hidden_input,
        regular_input_count: regular_input_count,
        signin_weight: signin_weight,
        signup_weight: signup_weight,
        signinForm: signin_weight > signup_weight,
        signupForm: signup_weight > signin_weight
    };

    return when.resolve(guess);
};

/**
 * [containsLoginForm detect if page has a login form or not]
 * @param  {[cheerioSelector]} $ [cheerio selecteor object]
 * @return {[promise]}      [resolve with true if page contains login form, otherwise, false]
 */
function containsLoginForm($) {
    return when.promise(function(resolve, reject) {
        let f = $('input[type=password]').parents('form');

        if (f.length === 0) { // if no input[type=password], for sure there is no sign in/up forms in this page
            return resolve(false);
        }

        var promises = [];
        f.each(function(i, el) {
            let html = $(el).html();
            promises.push(detect(i, html));
        });

        when.all(promises).then(function(results) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].signinForm) { // resolve with true, once first login form found
                    return resolve(true);
                }
            }
            return resolve(false);
        });
    });
}

module.exports = {
    containsLoginForm: containsLoginForm
}
