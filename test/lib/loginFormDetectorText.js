var should = require('should'),
    cheerio = require('cheerio'),
    loginFormDetector = require('../../lib/loginFormDetector');

var HTML_PAGE_WITH_NO_LOGIN_FORM =
    `<html>
    <head></head>
      <body>
        <form>
          <input type="text"></input>
          <div>
            <input type="text"></input>
          </div>
          <input type="submit" value="Sign in">
        </form>
      </body>
    </html>`;

var HTML_PAGE_WITH_LOGIN_FORM =
    `<html>
    <head></head>
    <body>
        <form>
            <input type="text"></input>
            <div>
                <input type="password"></input>
            </div>
            <input type="submit"></input>
        </form>
        <form class="ms-form" method="post" target="_top" action="/meinspiegel/login.html">
            <input type="hidden" name="backUrl" value="">

            <div class="row">
                <label for="f.loginName">Benutzername oder E-Mail-Adresse</label>
                <input id="f.loginName" type="text" name="f.loginName" value="">
            </div>

            <div class="row">
                <label for="f.password">Passwort</label>
                <input id="f.password" type="password" name="f.password" value="">
                <span class="small-info right"><a target="_top" href="/meinspiegel/newpassword.html">Sie haben Ihr Passwort vergessen?</a></span>
            </div>

            <div class="row autologin">
                <input class="checkbox-fa" id="f.returnAutologin" type="checkbox" name="f.returnAutologin">
                <label for="f.returnAutologin">Automatisches Login</label>

                <span class="small-info"><a href="/meinspiegel/artikel/a-703605.html" target="_blank">Was macht diese Funktion?</a></span>
            </div>

            <div class="row">
                <input class="form-button" type="submit" value="Anmelden">
            </div>

        </form>
    </body>
  </html>`;

var HTML_PAGE_WITH_MULTIPLE_LOGIN_FORM =
    `<html>
    <head></head>
      <body>
        <form id="form1">
          <input type="text"></input>
          <div>
            <input type="password"></input>
          </div>
          <input type="submit"></input>
        </form>
        <form id="form2">
          <input type="text"></input>
          <div>
            <input type="password"></input>
          </div>
          <input type="submit"></input>
        </form>
      </body>
    </html>`;

var HTML_PAGE_WITH_SIGNUP_FORM =
    `<html>
    <head></head>
      <body>
        <form>
          <input type="text"></input>
          <div>
            <input type="password"></input>
            <input type="password"></input>
          </div>
          <input type="submit"></input>
        </form>
        <form action="" class="form" method="post" autocomplete="off">
           <input type="hidden" id="track_id" name="track_id" value="353d45e3c0279c84a493c35086cae23bcf"><input type="hidden" id="language" name="language" value="en">
           <div class="block js-block block_name_firstname js-block_name_firstname control control_name_firstname" data-block="control_firstname" data-options="{}">
              <div class="control__label control__label_name_firstname"><label for="firstname">First name</label></div>
              <div class="control__cntrl"><input type="text" class="control__input control__input_name_firstname" value="" id="firstname" name="firstname" autocomplete="given-name" style="cursor: auto;"></div>
              <div class="control__error control__error__firstname_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
              <div class="control__error control__error__firstname_missingvalue g-hidden">Please enter your name</div>
              <div class="control__error control__error__firstname_toolong g-hidden">Please give a&nbsp;shorter first name, up&nbsp;to&nbsp;50&nbsp;characters</div>
           </div>
           <div class="block js-block block_name_lastname js-block_name_lastname control control_name_lastname" data-block="control_lastname" data-options="{}">
              <div class="control__label control__label_name_lastname"><label for="lastname">Surname</label></div>
              <div class="control__cntrl"><input type="text" class="control__input control__input_name_lastname" value="" id="lastname" name="lastname" autocomplete="family-name"></div>
              <div class="control__error control__error__lastname_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
              <div class="control__error control__error__lastname_missingvalue g-hidden">Please enter your surname</div>
              <div class="control__error control__error__lastname_toolong g-hidden">Please give a&nbsp;shorter last name, up&nbsp;to&nbsp;50&nbsp;characters</div>
           </div>
           <div class="block js-block block_name_login js-block_name_login control control_name_login" data-block="control_login" data-options="{}">
              <div class="control__label control__label_name_login"><label for="login">Enter a&nbsp;username</label></div>
              <div class="control__msg">
                 <div class="login__loading g-hidden">verifying …</div>
                 <div class="login__ok control__valid g-hidden">username available</div>
                 <div class="login__requirements js-requirements g-hidden">A login can consist of alphanumeric characters, and a single hyphen or period. It should begin with a letter, end with a letter or digit, and contain no more than 30 characters.</div>
              </div>
              <div class="control__cntrl"><input type="text" class="control__input control__input_name_login" value="" id="login" name="login" autocomplete="off"></div>
              <ol class="login__suggest g-hidden"></ol>
              <div class="control__error control__error__login_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
              <div class="control__error control__error__login_missingvalue g-hidden">you must select a&nbsp;username</div>
              <div class="control__error control__error__login_notavailable g-hidden">username not available</div>
              <div class="control__error control__error__login_prohibitedsymbols g-hidden">invalid username</div>
              <div class="control__error control__error__login_startswithdigit g-hidden">usernames cannot begin with a&nbsp;number</div>
              <div class="control__error control__error__login_toolong g-hidden">username too long</div>
              <div class="control__error control__error__login_startswithdot g-hidden">usernames cannot begin with a&nbsp;full-stop</div>
              <div class="control__error control__error__login_startswithhyphen g-hidden">usernames cannot begin with a&nbsp;hyphen</div>
              <div class="control__error control__error__login_endswithhyphen g-hidden">usernames cannot end with a&nbsp;hyphen</div>
              <div class="control__error control__error__login_doubleddot g-hidden">usernames cannot contain two full-stops in&nbsp;a&nbsp;row</div>
              <div class="control__error control__error__login_doubledhyphen g-hidden">usernames cannot contain two hyphens in&nbsp;a&nbsp;row</div>
              <div class="control__error control__error__login_dothyphen g-hidden">usernames cannot contain a&nbsp;full-stop and hyphen consecutively</div>
              <div class="control__error control__error__login_hyphendot g-hidden">usernames cannot contain a&nbsp;hyphen and full-stop consecutively </div>
              <div class="control__error control__error__login_endswithdot g-hidden">usernames cannot end with a&nbsp;full-stop</div>
           </div>
           <div class="block js-block block_name_password js-block_name_password control control_name_password" data-block="control_password" data-options="{}">
              <div class="control__label control__label_name_password"><label for="password">Enter a&nbsp;password</label></div>
              <div class="control__cntrl with-toggle"><span class="password-eye js-password-toggle-visibility toggleVisibility"></span><span class="password-eye js-password-toggle-visibility password-eye__hidden toggleVisibility g-hidden"></span><input type="password" name="fake-passwd" class="fake-autocomplete" style="background-image: url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAAXNSR0IArs4c6QAAAPhJREFUOBHlU70KgzAQPlMhEvoQTg6OPoOjT+JWOnRqkUKHgqWP4OQbOPokTk6OTkVULNSLVc62oJmbIdzd95NcuGjX2/3YVI/Ts+t0WLE2ut5xsQ0O+90F6UxFjAI8qNcEGONia08e6MNONYwCS7EQAizLmtGUDEzTBNd1fxsYhjEBnHPQNG3KKTYV34F8ec/zwHEciOMYyrIE3/ehKAqIoggo9inGXKmFXwbyBkmSQJqmUNe15IRhCG3byphitm1/eUzDM4qR0TTNjEixGdAnSi3keS5vSk2UDKqqgizLqB4YzvassiKhGtZ/jDMtLOnHz7TE+yf8BaDZXA509yeBAAAAAElFTkSuQmCC&quot;); background-repeat: no-repeat; background-attachment: scroll; background-size: 16px 18px; background-position: 98% 50%;" autocomplete="off"><input type="password" class="control__input control__input_name_password" value="" id="password" name="password" autocomplete="new-password"></div>
              <div class="password-indicator">
                 <div class="password-indicator__i">&nbsp;</div>
              </div>
              <div class="password-ok control__valid g-hidden">Secure<span class="password-legend"></span></div>
              <div class="control__error control__error__password_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
              <div class="control__error control__error__password_missingvalue g-hidden">You must enter a&nbsp;password</div>
              <div class="control__error control__error__password_likelogin g-hidden">Your password should not be&nbsp;the same as&nbsp;your username</div>
              <div class="control__error control__error__password_tooshort g-hidden">Password too short<span class="password-legend"></span></div>
              <div class="control__error control__error__password_weak g-hidden">Weak password<span class="password-legend"></span></div>
              <div class="control__error control__error__password_prohibitedsymbols g-hidden">Password contains invalid characters</div>
              <div class="control__error control__error__password_likeoldpassword g-hidden">It&nbsp;is&nbsp;the same as&nbsp;the current password</div>
              <div class="control__error control__error__password_foundinhistory g-hidden">This is&nbsp;the same as&nbsp;one of&nbsp;your previous passwords</div>
              <div class="control__error control__error__password_likephonenumber g-hidden">You cannot use your phone number as&nbsp;a&nbsp;password</div>
              <div class="control__error control__error__password_toolong g-hidden">Password too long<span class="password-legend"></span></div>
           </div>
           <div class="block js-block block_name_password-confirm js-block_name_password-confirm control control_name_password-confirm" data-block="control_password-confirm" data-options="{}">
              <div class="control__label control__label_name_password-confirm"><label for="password_confirm">Reenter to&nbsp;confirm</label></div>
              <div class="control__cntrl"><input type="password" class="control__input control__input_name_password-confirm" value="" id="password_confirm" name="password_confirm" autocomplete="new-password"></div>
              <div class="password-confirm__valid control__valid g-hidden">entered correctly</div>
              <div class="control__error control__error__password-confirm_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
              <div class="control__error control__error__password-confirm_missingvalue g-hidden">You must enter your password again</div>
              <div class="control__error control__error__password-confirm_notequal g-hidden">The passwords do&nbsp;not match</div>
           </div>
           <div class="control control_human-confirmation" data-block="control_human-confirmation" data-options="{}">
              <input type="hidden" class="control__input control__input_name_human-confirmation" value="phone" id="human-confirmation" name="human-confirmation">
              <div class="human-confirmation-switch-wrap"><label class="human-confirmation-switch human-confirmation-via-phone g-hidden">Please enter mobile phone number</label><label class="human-confirmation-switch human-confirmation-via-captcha">I don't have a mobile phone number</label></div>
              <div class="human-confirmation_phone">
                 <div class="control_phone-confirm" data-block="control_phone-confirm" data-options="{&quot;codeLabel&quot;:&quot;%phone-confirm_code_label&quot;}">
                    <input type="hidden" class="phone-confirm-fake-input" name="phone-confirm-state" value="">
                    <div class="block js-block block_name_phone-confirm-entry js-block_name_phone-confirm-entry control control_name_phone-confirm-entry" data-block="control_phone-confirm-entry" data-options="{&quot;codeLabel&quot;:&quot;%phone-confirm_code_label&quot;}">
                       <div class="control__label control__label_name_phone-confirm-entry"><label for="phone_number">Mobile number</label></div>
                       <div class="control__cntrl">
                          <input type="hidden" value="" id="phone_number_confirmed" name="phone_number_confirmed">
                          <div class="p-fillWidthGroup">
                             <div class="p-fillWidthGroup__item"><input type="tel" class="phone-confirm-entry__input control__input control__input_name_phone-confirm-entry" value="" id="phone_number" name="phone_number" autocomplete="tel"><input type="text" name="fake-login" class="fake-autocomplete" style="background-image: url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAAXNSR0IArs4c6QAAAPhJREFUOBHlU70KgzAQPlMhEvoQTg6OPoOjT+JWOnRqkUKHgqWP4OQbOPokTk6OTkVULNSLVc62oJmbIdzd95NcuGjX2/3YVI/Ts+t0WLE2ut5xsQ0O+90F6UxFjAI8qNcEGONia08e6MNONYwCS7EQAizLmtGUDEzTBNd1fxsYhjEBnHPQNG3KKTYV34F8ec/zwHEciOMYyrIE3/ehKAqIoggo9inGXKmFXwbyBkmSQJqmUNe15IRhCG3byphitm1/eUzDM4qR0TTNjEixGdAnSi3keS5vSk2UDKqqgizLqB4YzvassiKhGtZ/jDMtLOnHz7TE+yf8BaDZXA509yeBAAAAAElFTkSuQmCC&quot;); background-repeat: no-repeat; background-attachment: scroll; background-size: 16px 18px; background-position: 98% 50%;" autocomplete="off"></div>
                             <div class="p-fillWidthGroup__item">
                                <div class="init-confirm_wrap phone-confirm-entry__init-confirm-wrap"><button class="nb-button _nb-action-button _init init-confirm phone-confirm-entry__init-confirm ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" data-nb="button" id="nb-2" role="button"><span class="ui-button-text"><span class="_nb-button-content">Send code</span></span></button><span class="init-confirm_spinner g-hidden"></span></div>
                             </div>
                          </div>
                          <div class="phone-comment">For example, +1 xxx xxx xx xx</div>
                       </div>
                       <div class="control__error control__error__phone-confirm-entry_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
                       <div class="control__error control__error__phone-confirm-entry_badphonenumber g-hidden">Invalid number format</div>
                       <div class="control__error control__error__phone-confirm-entry_badphonenumberunmask g-hidden">You can only use your telephone number as&nbsp;a&nbsp;digital login</div>
                       <div class="control__error control__error__phone-confirm-entry_missingvalue g-hidden">Please enter your telephone number</div>
                    </div>
                    <div class="control control_name_phone-confirm-code g-hidden" data-block="control_phone-confirm-code" data-options="{&quot;codeLabel&quot;:&quot;%phone-confirm_code_label&quot;}">
                       <div class="control phone-confirm-code-fake-entry">
                          <div class="control__label control__label_name_phone-confirm-entry"><label for="phone-confirm-code-fake-entry-phone">Mobile number</label></div>
                          <div class="control__cntrl">
                             <div class="p-fillWidthGroup">
                                <div class="p-fillWidthGroup__item"><input type="text" class="control__input is-disabled" disabled="disabled"></div>
                                <div class="p-fillWidthGroup__item"><button class="nb-button _nb-normal-button _init back phone-confirm-code__back ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" data-nb="button" id="nb-3" role="button"><span class="ui-button-text"><span class="_nb-button-content">Edit phone number</span></span></button></div>
                             </div>
                          </div>
                          <p class="confirmation_sent">A code has been sent to the number <span class="selected_phone"></span>.</p>
                       </div>
                       <div class="phone-confirm-password g-hidden">
                          <div class="control__label control__label_name_phone-confirm-password"><label for="phone-confirm-password">Your Yandex account password</label></div>
                          <input type="password" class="control__input control__input_name_phone-confirm-password" value="" id="phone-confirm-password" name="phone-confirm-password" autocomplete="off">
                          <div class="control__error control__error__phone-confirm-code_passwordnotmatched g-hidden">Wrong password! To change your password, you have to enter the current password</div>
                          <div class="control__error control__error__phone-confirm-code_missingpassword g-hidden">You must enter your current password</div>
                       </div>
                       <div class="phone-confirm-code-itself">
                          <div class="control__label control__label_name_phone-confirm-code"><label for="phone-confirm-code">Confirmation code from SMS</label></div>
                          <div class="control__msg"></div>
                          <div class="control__cntrl control__cntrl_phone-confirm-code"><input type="tel" class="control__input code_entry"><button class="nb-button _nb-action-button _init submit_code js-confirm-code ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" data-nb="button" id="nb-4" role="button"><span class="ui-button-text"><span class="_nb-button-content">Confirm</span></span></button><span class="resend_code_wrap g-hidden"><span class="resend_code">Send code again</span><span class="resend_code_spinner g-hidden"></span></span></div>
                          <div class="control__error control__error__phone-confirm-code_missingvalue g-hidden">Please enter the code</div>
                          <div class="control__error control__error__phone-confirm-code_codeinvalid g-hidden">Invalid code, try again</div>
                          <div class="control__error control__error__phone-confirm-code_generic g-hidden">Unable to confirm this telephone number, try entering another number</div>
                          <div class="control__error control__error__phone-confirm-code_try_later g-hidden">It was not possible to confirm your phone number, please try again later</div>
                          <div class="control__error control__error__phone-confirm-code_captcharequired g-hidden">Internal passport error. Try going through process again in half an hour.</div>
                          <div class="control__error control__error__phone-confirm-code_global_logout g-hidden">You have been signed out of your account on all computers and devices. To restore access, you need to start the procedure <a href="/restoration">from the beginning</a>.</div>
                          <div class="control__error control__error__phone-confirm-code_limit_exceeded g-hidden">Attempt limit exceeded. Please try again later.</div>
                       </div>
                    </div>
                    <div class="control control_name_phone-confirm-acknowledgement g-hidden" data-block="control_phone-confirm-acknowledgement" data-options="{&quot;codeLabel&quot;:&quot;%phone-confirm_code_label&quot;}">
                       <div class="control__label control__label_name_phone-confirm-acknowledgement"><label for="phone-confirm-acknowledgement">Mobile number</label></div>
                       <div class="control__cntrl"><input type="text" class="control__input is-disabled" disabled="disabled"></div>
                       <div class="phone-confirm-acknowledgement_comment control__valid">Your phone number successfully confirmed</div>
                    </div>
                    <div class="control__error control__error__phone-confirm_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
                    <div class="control__error control__error__phone-confirm_needsconfirmation g-hidden">Please confirm your telephone number</div>
                    <div class="control__error control__error__phone-confirm_couldnotsend g-hidden">Failed to&nbsp;send an&nbsp;SMS to&nbsp;confirm your telephone number</div>
                    <div class="control__error control__error__phone-confirm_compromised g-hidden">This number has already been confirmed for three accounts. Please enter another</div>
                    <div class="control__error control__error__phone-confirm_bound_and_confirmed g-hidden">It&nbsp;was not possible to&nbsp;confirm your phone number, please try again later</div>
                    <div class="control__error control__error__phone-confirm_limitexceeded g-hidden">The number of&nbsp;attempts to&nbsp;confirm your telephone number has been exceeded. Refresh the page and confirm another number</div>
                    <div class="control__error control__error__phone-confirm_limitexceeded_one_number g-hidden">Exceeded the number of&nbsp;attempts to&nbsp;confirm the number. Please try again later</div>
                    <div class="control__error control__error__phone-confirm_invalidsecurephone g-hidden">Wrong phone number</div>
                    <div class="control__error control__error__phone-confirm_not_matched g-hidden">Wrong phone number</div>
                    <div class="control__error control__error__phone-confirm_invalidcaptcha g-hidden">Please enter the characters from the image to&nbsp;send the code</div>
                    <div class="control__error control__error__phone-confirm_global_logout g-hidden">You have been signed out of your account on all computers and devices. To restore access, you need to start the procedure <a href="/restoration">from the beginning</a>.</div>
                    <div class="control__error control__error__phone-confirm_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
                    <div class="control__error control__error__phone-confirm_badphonenumber g-hidden">Invalid number format</div>
                    <div class="control__error control__error__phone-confirm_badphonenumberunmask g-hidden">You can only use your telephone number as&nbsp;a&nbsp;digital login</div>
                    <div class="control__error control__error__phone-confirm_missingvalue g-hidden">Please enter your telephone number</div>
                 </div>
              </div>
              <div class="human-confirmation_captcha g-hidden">
                 <div class="block js-block block_name_question js-block_name_question control control_name_question" data-block="control_question" data-options="{}">
                    <div class="control__label control__label_name_question"><label for="hint_question_id">Security question</label></div>
                    <div class="control__cntrl">
                       <span data-nb-direction="bottom" data-nb="select" tabindex="0" class="nb-button _nb-normal-button nb-select _init _nb-select-button control__select control__select_name_question ui-autocomplete-input ui-widget ui-widget-content" id="hint_question_id" name="hint_question_id" autocomplete="off">
                          <span class="_nb-button-content">not selected</span><span class="_nb-select-helper"></span>
                          <select class="_nb-select-fallback" name="hint_question_id">
                             <option label="not selected" value="0" data-icon="">not selected</option>
                             <option label="Your favorite musician's surname" value="12" data-icon="">Your favorite musician's surname</option>
                             <option label="The street you grew up on" value="13" data-icon="">The street you grew up on</option>
                             <option label="Your favorite actor or actress" value="14" data-icon="">Your favorite actor or actress</option>
                             <option label="Your grandmother's date of birth" value="4" data-icon="">Your grandmother's date of birth</option>
                             <option label="Your parents' post code" value="3" data-icon="">Your parents' post code</option>
                             <option label="The brand of your first car" value="15" data-icon="">The brand of your first car</option>
                             <option label="Your favorite teacher's surname" value="16" data-icon="">Your favorite teacher's surname</option>
                             <option label="Your favorite childhood book" value="17" data-icon="">Your favorite childhood book</option>
                             <option label="Your favorite computer game" value="18" data-icon="">Your favorite computer game</option>
                             <option label="Set your own security question" value="99" data-icon="">Set your own security question</option>
                          </select>
                       </span>
                    </div>
                    <div class="control__error control__error__question_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
                    <div class="control__error control__error__question_missingvalue g-hidden">Please select a&nbsp;security question</div>
                 </div>
                 <div class="block js-block block_name_user-question js-block_name_user-question control control_name_user-question g-hidden" data-block="control_user-question" data-options="{}">
                    <div class="control__label control__label_name_user-question"><label for="hint_question">Create your own question</label></div>
                    <div class="control__cntrl"><input type="text" class="control__input control__input_name_user-question" value="" id="hint_question" name="hint_question" autocomplete="off"></div>
                    <div class="control__error control__error__user-question_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
                    <div class="control__error control__error__user-question_missingvalue g-hidden">Please select a&nbsp;question</div>
                    <div class="control__error control__error__user-question_toolong g-hidden">Security question too long</div>
                 </div>
                 <div class="block js-block block_name_answer js-block_name_answer control control_name_answer" data-block="control_answer" data-options="{}">
                    <div class="control__label control__label_name_answer"><label for="hint_answer">Answer to&nbsp;the security question</label></div>
                    <div class="control__cntrl"><input type="text" class="control__input control__input_name_answer" value="" id="hint_answer" name="hint_answer" autocomplete="off"></div>
                    <div class="control__error control__error__answer_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
                    <div class="control__error control__error__answer_missingvalue g-hidden">Please provide an&nbsp;answer to&nbsp;the security question</div>
                    <div class="control__error control__error__answer_toolong g-hidden">Security question answer too long</div>
                 </div>
                 <div class="block js-block block_name_captcha js-block_name_captcha control control_name_captcha text" data-block="control_captcha" data-options="{}">
                    <div class="control__label control__label_name_captcha"><label for="answer">Enter the characters</label></div>
                    <div class="control__cntrl"></div>
                    <script src="//yastatic.net/passport-frontend/0.2.59-9/public/js/soundmanager/soundmanager2-nodebug-jsmin.js"></script>
                    <div class="audio_system_failed g-hidden">Could not start audio. Try updating your browser</div>
                    <div class="captcha__auto-width-container">
                       <div class="captcha__recognize">
                          <div class="captcha__captcha"><img class="captcha__captcha__text" src="https://f.captcha.yandex.net/image?key=f35Zxfl64EyT8d4eJrYHpbpaDSu027uD"><button type="button" class="button captcha__captcha__audio play"><span class="button-content play"></span><span class="button-content playing"></span><span class="button-content loading"></span></button></div>
                          <div class="captcha__arrow"></div>
                          <div class="captcha__input-wrap js-captcha-input-wrap"><input type="text" class="control__input control__input_name_captcha js-captcha-field" id="answer" name="answer" autocomplete="off"><span class="captcha_confirm_spinner js-confirm_spinner g-hidden"></span></div>
                       </div>
                       <div class="captcha__switch js-captcha__switch"><span class="pseudo_link another">Show a different image</span><span class="spinner spinner_size__xxs captcha__spinner js-captcha-spinner g-hidden"></span></div>
                    </div>
                    <div class="js-captcha__valid control__valid g-hidden">Entered correctly</div>
                    <input class="captcha_key" type="hidden" name="key" value="f35Zxfl64EyT8d4eJrYHpbpaDSu027uD"><input class="captcha_mode" type="hidden" name="captcha_mode" value="text">
                    <div class="control__error control__error__captcha_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
                    <div class="control__error control__error__captcha_missingvalue g-hidden">You must enter the characters</div>
                    <div class="control__error control__error__captcha_captchalocate g-hidden">Error. Please try again</div>
                    <div class="control__error control__error__captcha_incorrect g-hidden">The characters were entered incorrectly. Please try again</div>
                 </div>
              </div>
              <div class="human-confirmation__warning_couldnotsend_wrap g-hidden"><span class="human-confirmation__warning_couldnotsend">Create a security question and answer</span></div>
              <div class="control__error control__error__human-confirmation_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
              <div class="control__error control__error__human-confirmation_unconfirmed g-hidden">You must choose and complete an&nbsp;access recovery method</div>
              <div class="control__error control__error__human-confirmation_confirmationsLimitReached g-hidden">You have used all attempts to&nbsp;confirm the telephone number. Please register, answering the security question and completing the CAPTCHA field</div>
           </div>
           <div class="control control_name_eula" data-block="control_eula">
              <input type="checkbox" name="eula_accepted" id="eula_accepted" checked="checked">
              <div class="control__label control__label_name_eula">
                 <label for="eula_accepted">
                    By clicking “Register”, I agree to the terms of the <a class="b-link b-link_form b-link_pseudo_yes trigger" href="//yandex.com/legal/rules/" target="_blank"><span class="b-link__inner">User Agreement</span></a>
                    <div class="b-eula content">
                       <div class="l-indent-small"><iframe src="//yandex.com/legal/rules/?mode=html&amp;lang=en"> </iframe></div>
                    </div>
                    and give my consent to Yandex to  process my personal data, in accordance with Federal Law №152-FZ “On Personal Data” dated 27.07.2006, for the purposes and conditions set out in the <a class="b-link b-link_form b-link_pseudo_yes trigger2" target="_blank" href="//yandex.com/legal/confidential/"><span class="b-link__inner">Privacy Policy</span></a>.
                    <div class="b-eula content2">
                       <div class="l-indent-small"><iframe src="//yandex.com/legal/confidential/?mode=html&amp;lang=en"> </iframe></div>
                    </div>
                 </label>
              </div>
              <div class="control__error control__error__eula_globalinternal g-hidden">Passport could not process the request. Please try again later or&nbsp;refresh the page.</div>
              <div class="control__error control__error__eula_missingvalue g-hidden">You must accept the terms of&nbsp;the User Agreement to&nbsp;continue</div>
           </div>
           <div class="control control_name_submit" data-block="control_submit" data-options="{&quot;alternative&quot;:false}"><button class="nb-button _nb-promo-button _init control_name_submit__button ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" data-nb="button" type="submit" id="nb-5" role="button"><span class="ui-button-text"><span class="_nb-button-content">Register</span></span></button></div>
        </form>
      </body>
    </html>`;

describe('loginFormDetector', function() {
    describe('containsLoginForm', function() {
        it('ignore form with no input[password]', function(done) {
            loginFormDetector.containsLoginForm(cheerio.load(HTML_PAGE_WITH_NO_LOGIN_FORM)).then(function(result) {
                result.should.be.false();
                done();
            });
        });

        it('detect login form', function(done) {
            loginFormDetector.containsLoginForm(cheerio.load(HTML_PAGE_WITH_LOGIN_FORM)).then(function(result) {
                result.should.be.true();
                done();
            });
        });

        it('detect mutiple login forms', function(done) {
            loginFormDetector.containsLoginForm(cheerio.load(HTML_PAGE_WITH_MULTIPLE_LOGIN_FORM)).then(function(result) {
                result.should.be.true();
                done();
            });
        });

        it('don\'t get fooled by signup forms', function(done) {
            loginFormDetector.containsLoginForm(cheerio.load(HTML_PAGE_WITH_SIGNUP_FORM)).then(function(result) {
                result.should.be.false();
                done();
            });
        });
    });

});
