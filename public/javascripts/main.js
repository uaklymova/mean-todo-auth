var app = angular.module('appTodo', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home', {
            url : '/home',
            templateUrl : '/home.html',
            controller : 'MainCtrl',
        }).state('todos', {
            url : '/todos/:id',
            templateUrl : '/posts.html',
            controller : 'PostsCtrl',
        }).state('login', {
            url : '/login',
            templateUrl : '/login.html',
            controller : 'AuthCtrl',
            
        }).state('register', {
            url : '/register',
            templateUrl : '/register.html',
            controller : 'AuthCtrl',
            
        });

        $urlRouterProvider.otherwise('home');
    }]);


function mainController($scope, $http) {
    // $scope.formData = {};
    //
    // $http.get('/api/todos')
    //     .success(function (data) {
    //         $scope.todos = data;
    //         console.log(data.length);
    //     })
    //     .error(function (data) {
    //         console.log("error: " + data);
    //     });
    // $scope.createTodo = function () {
    //     $http.post('/api/todos', $scope.formData)
    //         .success(function (data) {
    //             $scope.formData = {};
    //             $scope.todos = data;
    //             console.log(data);
    //         })
    //         .error(function (data) {
    //             console.log("error: " + data);
    //         });
    // };
    // $scope.deleteTodo = function(id) {
    //     $http.delete('/api/todos/' + id)
    //         .success(function(data) {
    //             $scope.todos = data;
    //             console.log(data);
    //         })
    //         .error(function(data) {
    //             console.log('Error: ' + data);
    //         });
    // };
}