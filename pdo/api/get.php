<?php

class Get
{
    private $pdo;
    #constructor
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }
    public function sendPayLoad($data, $remarks, $message, $code)
    {
        $status = array("remarks" => $remarks, "message" => $message);
        http_response_code($code);
        return $data;
    }

    public function executeQuery($sqlString)
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            if ($result = $this->pdo->query($sqlString)->fetchAll()) {
                foreach ($result as $record) {
                    array_push($data, $record);
                }
                $code = 200;
                $result = null;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
    }

    public function get_records($table, $conditions = null, $selectFields = '*', $orderBy = null)
    {
        $sqlStr = "SELECT $selectFields FROM $table";
        if ($conditions != null) {
            $sqlStr .= " WHERE " . $conditions;
        }

        if ($orderBy != null) {
            $sqlStr .= " ORDER BY " . $orderBy;
        }

        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            return $this->sendPayLoad($result['data'], "success", "Successfully retrieved data.", $result['code']);
        }

        return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
    }
    public function get_users($id = null)
    {
        $conditions = null;
        if ($id != null) {
            $conditions = "userid = $id";
        }
        return $this->get_records("users", $conditions);
    }
    public function get_posts($id = null)
    {
        $conditions = null;

        $selectFields = "posts.*, users.username";
        $joinCondition = "posts.userid = users.userid";

        if ($id != null) {
            $conditions = "postid = $id";
        }

        $orderBy = "posts.created_at DESC";

        return $this->get_records("posts INNER JOIN users ON $joinCondition", $conditions, $selectFields, $orderBy);
    }
    public function get_comments($postid = null)
    {
        $conditions = "";

        if ($postid !== null) {
            $conditions = "comments.postid = $postid";
        }

        $selectFields = "comments.*, users.username, users.profilephoto";
        $joinCondition = "comments.userid = users.userid";

        $orderBy = "comments.created_at DESC";

        return $this->get_records("comments INNER JOIN users ON $joinCondition", $conditions, $selectFields, $orderBy);
    }
}
