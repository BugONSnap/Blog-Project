<?php

class Post
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

        return array(
            "status" => $status,
            "data" => $data,
            "prepared_by" => "neon",
            "timestamp" => date_create(),
            "code" => $code
        );
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
    //Login
    public function login($data)
    {
        //Initialize
        $email = $data->email;
        $password = $data->password;
        //Check if Email Exists
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        // If User Found
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if ($password == $user['password']) {
                return $user;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    //Registration
    public function registration($data)
    {
        // Initialize
        $email = $data->email;
        $username = $data->username;
        $password = $data->password;

        // Check if Email Exists
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();

        // If User Found
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            return 'Email already exists';
        }

        // Register the User
        $sql = "INSERT INTO users (username, email, password) VALUES (:username, :email, :password)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->bindParam(':password', $password, PDO::PARAM_STR);
        $register = $stmt->execute();

        // Check if registration was successful
        if ($register) {
            $userID = $this->pdo->lastInsertId();
            return $userID;
        } else {
            return null;
        }
    }

    public function createPost($data)
    {
        // Extract post data from $_POST
        $id = $_POST['userid'];
        $title = $_POST['title'];
        $description = $_POST['description'];

        // Insert post into the database (without file path)
        $query = "INSERT INTO posts (userid, title, description) VALUES (:userid, :title, :description)";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute([
            ':userid' => $id,
            ':title' => $title,
            ':description' => $description
        ]);

        // Get the ID of the newly created post
        $postId = $this->pdo->lastInsertId();

        // Run image upload if a file is uploaded
        $filePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $filePath = $this->imageUpload($_FILES['image'], $postId);
        }

        // If image was uploaded, update the post with the image path
        if ($filePath) {
            $updateQuery = "UPDATE posts SET photo = :image WHERE postid = :postId";
            $updateStmt = $this->pdo->prepare($updateQuery);
            $updateStmt->execute([
                ':image' => $filePath,
                ':postId' => $postId
            ]);
        }

        return $postId;
    }

    private function imageUpload($fileData, $postId)
    {
        if (!isset($fileData) || $fileData === null) {
            return;
        }
        // EXTRACTING FILE INFORMATION FROM $FILEDATA
        $fileName = $fileData['name'];
        $fileSize = $fileData['size'];
        $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);

        // CHECK IF FILE IS AN IMAGE
        $allowedExtensions = array(
            'jpg',
            'jpeg',
            'png',
            'gif',
            'bmp',
            'svg',
            'webp',
            'tiff',
            'tif',
            'ico',
            'psd',
            'raw',
            'heic',
            'heif',
            'avif',
            'jfif',
            'pjpeg'
        );
        if (!in_array(strtolower($fileExt), $allowedExtensions)) {
            return;
        }

        // CHECK IF FILE IS A VALID IMAGE
        $imageInfo = getimagesize($fileData['tmp_name']);
        if (!$imageInfo) {
            return;
        }

        // CREATE THE DIRECTORY THAT STORES FILES IF IT DOESN'T ALREADY EXIST
        $dir =  __DIR__ . '/../images/posts';
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }

        // CREATES DIRECTORY FOR POST
        $postDir = $dir . "/" . $postId;

        if (!file_exists($postDir)) {
            mkdir($postDir, 0777, true);
        }

        $targetDir = $postDir . "/";
        $baseFileName = pathinfo($fileName, PATHINFO_FILENAME);
        $targetFile = $targetDir . $fileName;

        // CHECK IF FILE ALREADY EXISTS
        $counter = 1;
        $baseFileName = pathinfo($fileName, PATHINFO_FILENAME);
        $newFileName = $baseFileName;
        $targetFile = $targetDir . $newFileName . '.' . $fileExt;

        while (file_exists($targetFile)) {
            $newFileName = $baseFileName . "($counter)";
            $targetFile = $targetDir . '/' . $newFileName . '.' . $fileExt;
            $counter++;
        }

        move_uploaded_file($fileData["tmp_name"], $targetFile);

        // FILE PATH FOR DB
        $file_path = $postId . "/" . $newFileName . "." . $fileExt;

        return $file_path;
    }


    public function updatePost($data)
    {
        // Extract post data from $data
        $title = isset($_POST['title']) ? $_POST['title'] : null;
        $description = isset($_POST['description']) ? $_POST['description'] : null;
        $postId = $_POST['postid'];

        // Build the update query
        $updateQuery = "UPDATE posts SET ";
        $params = [];

        // Update title if provided
        if ($title !== null) {
            $updateQuery .= "title = :title, ";
            $params[':title'] = $title;
        }

        // Update description if provided
        if ($description !== null) {
            $updateQuery .= "description = :description, ";
            $params[':description'] = $description;
        }

        // Trim the trailing comma and space
        $updateQuery = rtrim($updateQuery, ', ');

        // Add the WHERE clause
        $updateQuery .= " WHERE postid = :postId";
        $params[':postId'] = $postId;

        // Prepare and execute the update statement
        $stmt = $this->pdo->prepare($updateQuery);
        $stmt->execute($params);

        // Run image upload if a new file is uploaded
        $filePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $filePath = $this->imageUpload($_FILES['image'], $postId);
        }

        // If an image was uploaded, update the post with the new image path
        if ($filePath) {
            $updateImageQuery = "UPDATE posts SET photo = :image WHERE postid = :postId";
            $updateImageStmt = $this->pdo->prepare($updateImageQuery);
            $updateImageStmt->execute([
                ':image' => $filePath,
                ':postId' => $postId
            ]);
        }

        return $postId;
    }


    public function viewPost($data)
    {
        $postId = $data;

        $query = "UPDATE posts SET views = views + 1 WHERE postid = :postid";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute([':postid' => $postId]);

        $query = "SELECT * FROM posts WHERE postid = :postid";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute([':postid' => $postId]);

        $post = $stmt->fetch(PDO::FETCH_ASSOC);

        return $post;
    }

    public function deletePost($postid)
    {
        try {
            $query = "DELETE FROM posts WHERE postid = ?";

            $stmt = $this->pdo->prepare($query);

            $stmt->execute([$postid]);

            if ($stmt->rowCount() > 0) {
                return $this->sendPayLoad(null, "success", "Post deleted successfully.", 200);
            } else {
                return $this->sendPayLoad(null, "failed", "No post found or could not be deleted.", 500);
            }
        } catch (\PDOException $e) {
            // Return an error payload in case of exception
            return $this->sendPayLoad(null, "error", "Error: " . $e->getMessage(), 500);
        }
    }


    public function createCommment($data)
    {
        $postid = $data->postid;
        $userid = $data->userid;
        $comment = $data->comment;

        $query = "INSERT INTO comments (postid, userid, comment) VALUES (:postid, :userid, :comment)";
        $stmt = $this->pdo->prepare($query);
        $commentSql = $stmt->execute([
            ':postid' => $postid,
            ':userid' => $userid,
            ':comment' => $comment
        ]);

        if ($commentSql) {
            $commentId = $this->pdo->lastInsertId();
            return $commentId;
        } else {
            return null;
        }
    }

    public function profileUpload($data)
    {
        $id = $_POST['userid'];
        $image = $_FILES['image'];

        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $filePath = $this->profilePhotoUpload($_FILES['image'], $id);
        }

        // If image was uploaded, update the post with the image path
        if ($filePath) {
            $updateQuery = "UPDATE users SET profilephoto = :image WHERE userid = :userid";
            $updateStmt = $this->pdo->prepare($updateQuery);
            $updateStmt->execute([
                ':image' => $filePath,
                ':userid' => $id
            ]);
        }

        return $id;
    }

    private function profilePhotoUpload($fileData, $userId)
    {
        if (!isset($fileData) || $fileData === null) {
            return;
        }
        // EXTRACTING FILE INFORMATION FROM $FILEDATA
        $fileName = $fileData['name'];
        $fileSize = $fileData['size'];
        $fileExt = pathinfo($fileName, PATHINFO_EXTENSION);

        // CHECK IF FILE IS AN IMAGE
        $allowedExtensions = array(
            'jpg',
            'jpeg',
            'png',
            'gif',
            'bmp',
            'svg',
            'webp',
            'tiff',
            'tif',
            'ico',
            'psd',
            'raw',
            'heic',
            'heif',
            'avif',
            'jfif',
            'pjpeg'
        );
        if (!in_array(strtolower($fileExt), $allowedExtensions)) {
            return;
        }

        // CHECK IF FILE IS A VALID IMAGE
        $imageInfo = getimagesize($fileData['tmp_name']);
        if (!$imageInfo) {
            return;
        }

        // CREATE THE DIRECTORY THAT STORES FILES IF IT DOESN'T ALREADY EXIST
        $dir =  __DIR__ . '/../images/users';
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }

        // CREATES DIRECTORY FOR POST
        $userDir = $dir . "/" . $userId;

        if (!file_exists($userDir)) {
            mkdir($userDir, 0777, true);
        }

        $targetDir = $userDir . "/";
        $baseFileName = pathinfo($fileName, PATHINFO_FILENAME);
        $targetFile = $targetDir . $fileName;

        // CHECK IF FILE ALREADY EXISTS
        $counter = 1;
        $baseFileName = pathinfo($fileName, PATHINFO_FILENAME);
        $newFileName = $baseFileName;
        $targetFile = $targetDir . $newFileName . '.' . $fileExt;

        while (file_exists($targetFile)) {
            $newFileName = $baseFileName . "($counter)";
            $targetFile = $targetDir . '/' . $newFileName . '.' . $fileExt;
            $counter++;
        }

        move_uploaded_file($fileData["tmp_name"], $targetFile);

        // FILE PATH FOR DB
        $file_path = $userId . "/" . $newFileName . "." . $fileExt;

        return $file_path;
    }
}
