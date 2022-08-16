<?php
if (!defined("THISPAGE")) {
    exit;
}

function checkrecaptcha($response)
{
    if (isset($response)) {

        // Build POST request:
        $recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
        $recaptcha_secret = RECAPTCHA_SECRETKEY;
        $recaptcha_response = $response;

        // Make and decode POST request:
        $recaptcha = file_get_contents($recaptcha_url . '?secret=' . $recaptcha_secret . '&response=' . $recaptcha_response);
        $recaptcha = json_decode($recaptcha);
        //dump($recaptcha);
        if ($recaptcha->success)
        {
            if ($recaptcha->score >= 0.5) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}