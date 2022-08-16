<?php
if (!defined("THISPAGE")) {
    exit;
}
class sql
{
    public $sqlcnt = 0;
    public $sqltrace = "";
    private $stmt;
    private $dbh;
    private $error;

    public function __construct($host, $user, $pass, $dbname, $driver = "mysql", $debug = false)
    {
        $this->host = $host;
        $this->user = $user;
        $this->pass = $pass;
        $this->dbname = $dbname;
        $this->driver = $driver;
        $this->debug = $debug;
        $dsn = $this->driver . ':host=' . $this->host . ';dbname=' . $this->dbname . ";charset=utf8mb4";
        $options = array(
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "set names utf8mb4"
        );
        try {
            $this->dbh = new PDO($dsn, $this->user, $this->pass, $options);
            /*if (strpos($this->dbh->getAttribute(PDO::ATTR_CLIENT_VERSION), 'mysqlnd') !== false) {
                echo 'PDO MySQLnd enabled!';
                exit;
            } else {
                echo 'PDO MySQLnd DISABLED!';
                exit;
            }*/
        } catch (PDOException $e) {
            echo $this->error = $e->getMessage();
            exit;
        }
    }

    public function getmatch($string, $start, $end)
    {
        preg_match_all('/' . preg_quote($start, '/') . '(.*?)' . preg_quote($end, '/') . '/', $string, $matches);
        return $matches[1];
    }

    public function qry($query)
    {
        $this->sqlcnt++;
        if ($this->debug) {
            $dbgt = debug_backtrace();
            //dump($dbgt);
            $this->sqltrace .= "<span style='color:#000;'>#:&nbsp;&nbsp;</span><span style='color:#333;'>" . $this->sqlcnt . "</span><br>";
            $this->sqltrace .= "<span style='color:#000;'>FILE:&nbsp;&nbsp;</span><span style='color:#333;'>" . $dbgt[0]["file"] . "</span><br>";
            $this->sqltrace .= "<span style='color:#000;'>LINE:&nbsp;&nbsp;</span><span style='color:#333;'>" . $dbgt[0]["line"] . "</span><br>";
            $match = $this->getmatch($query, "`", "`");
            $qryy = $query;
            foreach ($match as $m) {
                $qryy = str_replace($m, "<span style='color:#00f;'>" . $m . "</span>", $qryy);
            }
            $this->sqltrace .= "<span style='color:#000;'>QRY:&nbsp;&nbsp;</span><span style='color:#408;'>" . $qryy . "</span><br><br>";
            echo $this->sqltrace;
            $this->sqltrace = "";
        }
        $this->stmt = $this->dbh->prepare($query);
    }

    public function bind($param, $value, $type = null)
    {
        if (is_null($type)) {
            switch (true) {
                case is_int($value):
                    $type = PDO::PARAM_INT;
                    break;
                case is_bool($value):
                    $type = PDO::PARAM_BOOL;
                    break;
                case is_null($value):
                    $type = PDO::PARAM_NULL;
                    break;
                default:
                    $type = PDO::PARAM_STR;
            }
        }
        $this->stmt->bindValue($param, $value, $type);
    }

    public function exe()
    {
        return $this->stmt->execute();
    }

    public function getrows()
    {
        $this->stmt->execute();
        return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getrow()
    {
        $this->stmt->execute();
        return $this->stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getresult()
    {
        $this->stmt->execute();
        $result = $this->stmt->fetch(PDO::FETCH_ASSOC);
        foreach ($result as $k => $v)
            break;
        return $v;
    }

    public function getnumrows()
    {
        return $this->stmt->rowCount();
    }

    public function getid()
    {
        return $this->dbh->lastInsertId();
    }

    public function collect()
    {
        return $this->dbh->beginTransaction();
    }

    public function send()
    {
        return $this->dbh->commit();
    }

    public function revoke()
    {
        return $this->dbh->rollBack();
    }

    public function debug()
    {
        return $this->stmt->debugDumpParams();
    }

}

function errorlog($sql, $ex, $qry, $line = 0)
{
    //echo $ex."<br>";
    //echo $qry."<br>";

    try {
        $sql->qry("INSERT INTO `sql_error` (`error`, `query`, `page`, `line`) VALUES (:ex, :qry, :page, :line)");
        $sql->bind(":ex", $ex);
        $sql->bind(":qry", $qry);
        $sql->bind(":page", $_SERVER['PHP_SELF']);
        $sql->bind(":line", $line);
        $sql->exe();
    } catch (PDOException $ex) {
    }
}

function sqlcollect($qry, $last = array(), $binding = false)
{
    $newarray = array();
    foreach ($last as $l) {
        $newarray[] = $l;
    }
    $newarray[] = array("qry" => $qry, "binding" => $binding);
    return $newarray;
}

function sqlsend($sql, $qrydata)
{
    $qryinfo = array();
    try {
        $sql->collect();
        foreach ($qrydata as $qry) {
            $qryinfo[] = str_replace("),", "),\n", $qry["qry"]);
            $sql->qry($qry["qry"]);
            if (isset($qry["binding"]) && $qry["binding"]) {
                $binding = $qry["binding"];
                if (is_array($binding[0])) {
                    foreach ($binding as $b) {
                        $sql->bind($b[0], $b[1]);
                    }
                } else {
                    $sql->bind($binding[0], $binding[1]);
                }
            }
            $sql->exe();
        }
        $sql->send();
        return true;
    } catch (PDOException $ex) {
        $sql->revoke();
        errorlog($sql, $ex->getMessage(), implode(";\n\n", $qryinfo));
        return false;
    }
}

function sqlexe($sql, $qry, $binding = false)
{
    try {
        $sql->qry($qry);
        if ($binding) {
            if (is_array($binding[0])) {
                foreach ($binding as $b) {
                    $sql->bind($b[0], $b[1]);
                }
            } else {
                $sql->bind($binding[0], $binding[1]);
            }
        }
        $sql->exe();
        return $sql->getid();
    } catch (PDOException $ex) {
        $bt = debug_backtrace();
        $caller = array_shift($bt);
        $line = $caller["line"];
        errorlog($sql, $ex->getMessage(), $qry, $line);
        return false;
    }
}

function sqlqry($sql, $qry, $binding = false)
{
    try {
        $sql->qry($qry);
        if ($binding) {
            if (is_array($binding[0])) {
                foreach ($binding as $b) {
                    $sql->bind($b[0], $b[1]);
                }
            } else {
                $sql->bind($binding[0], $binding[1]);
            }
        }
        $value = $sql->getrows();
    } catch (PDOException $ex) {
        $bt = debug_backtrace();
        $caller = array_shift($bt);
        $line = $caller["line"];
        errorlog($sql, $ex->getMessage(), $qry, $line);
        return false;
    }
    return $value;
}

function sqlqry2($sql, $qry, $binding = false)
{
    try {
        $sql->qry($qry);
        if ($binding) {
            if (is_array($binding[0])) {
                foreach ($binding as $b) {
                    $sql->bind($b[0], $b[1]);
                }
            } else {
                $sql->bind($binding[0], $binding[1]);
            }
        }
        $value = $sql->getrows();
		if (count($value) == 1) {
			//echo "[ A ]<br>";
			if (count($value[0]) > 1) {
				//echo "[ A - a ]<br>";
				return $value[0];
			} else {
				//echo "[ A - b ]<br>";
				foreach ($value[0] as $k => $v)
					break;
				return $v;
			}
		} else if (count($value) > 1) {
			//echo "[ B ]<br>";
			$onlyone = true;
			$newv = array();
			foreach ($value as $k => $v) {
				//dump($v);
				if (count($v) > 1)
					$onlyone = false;
				foreach ($v as $kk => $vv) {
					$newv[] = $vv;
				}
			}
			if ($onlyone) {
				//echo "[ B - a ]<br>";
				return $newv;
			} else {
				//echo "[ B - b ]<br>";
				return $value;
			}
		}
    } catch (PDOException $ex) {
        $bt = debug_backtrace();
        $caller = array_shift($bt);
        $line = $caller["line"];
        errorlog($sql, $ex->getMessage(), $qry, $line);
        return false;
    }
}

function sqlclean($val)
{
    return str_replace("'", "\'", $val);
}

function mysqldate($time = false) {
    if ($time === false)
        $time = time();
    return date("Y-m-d H:i:s", $time);
}
function mysqlshortdate($time = false) {
    if ($time === false)
        $time = time();
    return date("Y-m-d", $time);
}