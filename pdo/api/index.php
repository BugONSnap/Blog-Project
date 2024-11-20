<?php
include "./get.php";
include "./post.php";
include "../config/database.php";

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: *');

// Centralized CORS handling for OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: *');
    exit;
}

$con = new Connection();
$pdo = $con->connect();

$get = new Get($pdo);
$post = new Post($pdo);



//echo $_REQUEST['request'];
if (isset($_REQUEST['request']))
    $request = explode('/', $_REQUEST['request']);
else {
    http_response_code(404);
}


switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch ($request[0]) {
            case 'get_users':
                if (count($request) > 1) {
                    echo json_encode($get->get_users($request[1]));
                } else {
                    echo json_encode($get->get_users());
                }
                break;
            case 'get_comments':
                if (count($request) > 1) {
                    echo json_encode($get->get_comments($request[1]));
                } else {
                    echo json_encode($get->get_comments());
                }
                break;
            case 'get_posts':
                if (count($request) > 1) {
                    echo json_encode($get->get_posts($request[1]));
                } else {
                    echo json_encode($get->get_posts());
                }
                break;
            default:
                http_response_code(403);
                break;
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'login':
                echo json_encode($post->login($data));
                break;
            case 'register':
                echo json_encode($post->registration($data));
                break;
            case 'profile_upload':
                echo json_encode($post->profileUpload($data));
                break;
            case 'create_post':
                echo json_encode($post->createPost($data));
                break;
            case 'update_post':
                echo json_encode($post->updatePost($data));
                break;
            case 'delete_post':
                if (isset($data->postid)) {
                    echo json_encode($post->deletePost($data->postid));
                }
                break;
            case 'view_post':
                echo json_encode($post->viewPost($data));
                break;
            case 'create_comment':
                echo json_encode($post->createCommment($data));
                break;
            default:
                http_response_code(403);
                break;
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'delete_post':
                if (isset($data->postid)) {
                    echo json_encode($post->deletePost($data->postid));
                }
                break;
            default:
                http_response_code(403);
                break;
        }

        break;

    default:
        http_response_code(403);
        break;
}
