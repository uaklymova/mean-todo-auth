var app = angular.module('todoApp', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url : '/home',
            templateUrl : '/home.html',
            controller : 'MainCtrl'
            })
            .state('login', {
                url : '/login',
                templateUrl : '/login.html',
                controller : 'AuthCtrl'
            })
            .state('register', {
                url : '/register',
                templateUrl : '/register.html',
                controller : 'AuthCtrl'
            })
            .state('profile', {
                url : '/profile',
                templateUrl : '/profile.html',
                controller : 'MainCtrl'
                // resolve : {
                //     todoPromise : ['todos',
                //         function(todos) {
                //             return todos.getAll();
                //         }]
                //
                // }

            });

        $urlRouterProvider.otherwise('home');
    }]);

app.factory('todos', ['$http',
    function($http) {
        var o = {
            todos : []
        };
        o.getAll = function() {
            // return $http.get('/users/:user/todos').success(function(data) {
            return $http.get('/users').success(function(data) {

                angular.copy(data, o.todos);
            });
        };
        o.create = function(post) {
            return $http.post('/posts', post, {
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).success(function(data){
                o.posts.push(data);
            });
        };


        o.get = function(id) {
            //use the express route to grab this post and return the response
            //from that route, which is a json of the post data
            //.then is a promise, a kind of newly native thing in JS that upon cursory research
            return $http.get('/posts/' + id).then(function(res) {
                return res.data;
            });
        };
        //using express
        o.addComment = function(id, comment) {
            return $http.post('/posts/' + id + '/comments', comment, {
                headers: {Authorization: 'Bearer '+auth.getToken()}
            });
        };

        return o;
    }]);


app.controller('MainCtrl', ['$scope',
    function($scope) {
        // $scope.posts = posts.posts;
        // $scope.isLoggedIn = auth.isLoggedIn;
        // $scope.title = '';
        //
        // $scope.addPost = function() {
        //     if ($scope.title === '') {
        //         return;
        //     }
        //     posts.create({
        //         title : $scope.title,
        //         link : $scope.link,
        //     });
        //     //clear the values
        //     $scope.title = '';
        //     $scope.link = '';
        // };
    }]);

app.factory('auth', ['$http', '$window',
    function($http, $window) {
        var auth = {};

        auth.saveToken = function(token) {
            $window.localStorage['todoApp'] = token;
        };

        auth.getToken = function() {
            return $window.localStorage['todoApp'];
        };

        auth.isLoggedIn = function() {
            var token = auth.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        };

        auth.register = function(user) {
            return $http.post('/register', user).then(function(data) {
                auth.saveToken(data.token);
            });
        };
        auth.logIn = function(user) {
            return $http.post('/login', user).then(function(data) {
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function() {
            $window.localStorage.removeItem('appTodo');
        };

        return auth;
    }]);


app.controller('AuthCtrl', ['$scope', '$state', 'auth',
    function($scope, $state, auth) {
        $scope.user = {
            username : "",
            password : ""
        };

        $scope.register = function() {
            auth.register($scope.user).
            then(function() {
                $state.go('profile');
            })
                .catch(function(error) {
                $scope.error = error;
            });
        };

        $scope.logIn = function() {
            auth.logIn($scope.user)
                .then(function() {
                $state.go('profile');
            }).catch(function(error) {
                $scope.error = error;
            });
        };
    }]);
