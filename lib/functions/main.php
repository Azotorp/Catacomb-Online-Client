<?php
if (!defined("THISPAGE")) {
    exit;
}
function setval($var, $value, $time = 3600 * 24 * 7, $path = "/", $domain = DOMAINNAME) {
    setcookie($var, $value, time() + $time, $path, $domain, true, true);
    return $value;
}
function getval($var, $default = "") {
    return isset($_COOKIE[$var]) ? $_COOKIE[$var] : $default;
}
function req($var, $default = "") {
    return isset($_REQUEST[$var]) ? $_REQUEST[$var] : $default;
}
function post($var, $default = "") {
    return isset($_POST[$var]) ? $_POST[$var] : $default;
}
function get($var, $default = "") {
    return isset($_GET[$var]) ? $_GET[$var] : $default;
}

function urlredirect($url, $type = 1) {
    if ($type == 1) {
        header("HTTP/1.1 301 Moved Permanently");
        header("Location: $url");
        exit();
    } else {
        header("Location: $url");
        exit();
    }
}

function get_ts($start)
{
    return 1000 * (microtime(true) - $start);
}

function getascii($str)
{
    return strtr(utf8_decode($str),
        utf8_decode(
            'ŠŒŽšœžŸ¥µÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ'),
        'SOZsozYYuAAAAAAACEEEEIIIIDNOOOOOOUUUUYsaaaaaaaceeeeiiiionoooooouuuuyy');
}

function array_join(array $list, $glue = ", ", $conjunction = ' & ') {
    $last = array_pop($list);
    if ($list) {
        return implode($glue, $list).$conjunction.$last;
    }
    return $last;
}

function redirect_self($query = false)
{
    if ($query)
    {
        $redirect = 'https://' . $_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
    } else {
        $gotopage = explode(".", basename($_SERVER['PHP_SELF']));
        $gotopage = $gotopage[0];
        if ($gotopage == "index")
        {
            $redirect = 'https://' . $_SERVER['HTTP_HOST'];
        } else {
            $redirect = 'https://' . $_SERVER['HTTP_HOST'] ."/". $gotopage;
        }
    }
    urlredirect($redirect, 0);
}

function dump($data) {
    echo "<div style='background-color:#000;display:block;overflow: scroll'><div style='background-color:#090;display:block;'><span style='color:#0f0'>###################&nbsp;&nbsp;&nbsp;START&nbsp;&nbsp;&nbsp;###################</span></div>";
    echo "<div style='color:#fff;text-align:left'><pre>";
    if (is_array($data)) {
        array_walk_recursive($data, function(&$v) { $v = htmlspecialchars($v); });
    } else {
        if (is_object($data)) {
            $data = object_to_array($data);
            array_walk_recursive($data, function(&$v) { $v = htmlspecialchars($v); });
        } else {
            $data = htmlspecialchars($data);
        }
    }
    var_export($data);
    echo "</pre></div>";
    echo "<div style='background-color:#900;display:block;'><span style='color:#f00'>###################&nbsp;&nbsp;&nbsp;END&nbsp;&nbsp;&nbsp;###################</span></div></div>";
}

function object_to_array($data)
{
    if (is_array($data) || is_object($data))
    {
        $result = array();
        foreach ($data as $key => $value) {
            if (is_array($value) || is_object($value)) {
                foreach ($value as $key2 => $value2) {
                    $result[$key][$key2] = object_to_array($value2);
                }
            } else {
                $result[$key] = object_to_array($value);
            }
        }
        return $result;
    }
    return $data;
}

function get_ip()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP']))   //check ip from share internet
    {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }
    elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))   //to check ip is pass from proxy
    {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    else
    {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

function condensetag($tag)
{
    $tag = str_replace(" ", "", $tag);
    $tag = str_replace("'", "", $tag);
    $tag = str_replace("\\", "", $tag);
    $tag = str_replace("/", "", $tag);
    return strtolower($tag);
}

function dhms($seconds, $type = 0) {
    $d = $seconds / 86400;
    $dd = floor($d);
    $h = ($d - $dd) * 24;
    $hh = floor($h);
    $m = ($h - $hh) * 60;
    $mm = floor($m);
    $s = ($m - $mm) * 60;
    $ss = floor($s);
    $s_str = $ss;
    $m_str = $mm;
    $h_str = $hh;
    $d_str = $dd;
    if ($type == 0) {
        if ($dd > 0)
            return $d_str." days ".$h_str ." hours ". $m_str. " mins";
        else if ($hh > 0)
            return $h_str ." hours ". $m_str ." mins";
        else if ($mm > 0)
            return $m_str ." mins";
        else
            return $s_str ." sec";
    }
    if ($type == 1) {
        if ($dd > 0)
            return $d_str."d ".$h_str ."h ". $m_str. "m ".$s_str ."s";
        else if ($hh > 0)
            return $h_str ."h ". $m_str ."m ".$s_str ."s";
        else if ($mm > 0)
            return $m_str ."m ".$s_str ."s";
        else
            return $s_str ."s";
    }
    if ($type == 2) {
        if ($dd > 0) {
            if ($hh > 0) {
                if ($mm > 0) {
                    return $d_str . "d " . $h_str . "h " . $m_str . "m";
                } else {
                    return $d_str . "d " . $h_str . "h";
                }
            } else {
                return $d_str."d";
            }
        } else {
            if ($hh > 0) {
                if ($mm > 0) {
                    return $h_str . "h " . $m_str . "m " . $s_str . "s";
                } else {
                    return $h_str . "h";
                }
            } else {
                if ($mm > 0) {
                    if ($ss > 0) {
                        return $m_str . "m " . $s_str . "s";
                    } else {
                        return $m_str . "m";
                    }
                } else {
                    if ($ss > 0)
                        return $s_str . "s";
                    else
                        return "";
                }
            }
        }
    }
}

function redirect($url)
{
    if (!headers_sent())
    {
        header('Location: '.$url);
        exit;
    }
    else
    {
        echo '<script type="text/javascript">';
        echo 'window.location.href="'.$url.'";';
        echo '</script>';
        echo '<noscript>';
        echo '<meta http-equiv="refresh" content="0;url='.$url.'" />';
        echo '</noscript>';
        exit;
    }
}

# A function which returns users IP
function client_ip()
{
    return get_ip();
}

# Check user's avatar type
function is_animated($avatar)
{
    $ext = substr($avatar, 0, 2);
    if ($ext == "a_")
    {
        return ".gif";
    }
    else
    {
        return ".png";
    }
}
