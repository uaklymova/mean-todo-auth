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
                controller : 'ProfileCtrl',
                onEnter : ['$state', 'auth',
                    function($state, auth) {
                        if (!auth.isLoggedIn()) {
                            $state.go('home');
                        }}],
                resolve : {
                    todoPromise : ['todos',
                        function(todos) {
                            return todos.getAll();
                        }]
                }

            });

        $urlRouterProvider.otherwise('home');
    }]);

app.factory('todos', ['$http','auth',
    function($http, auth) {
        var o = {
            todos : []
        };
        o.getAll = function() {
            return $http.get('/users/:user/todos', {
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).then(function(res) {
                angular.copy(res, o.todos);
            });
        };
        o.createTodo = function(todo) {
            return $http.post('/users/:user/todos', todo, {
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).then(function(res){
                o.todos.data.push(res.data);
            });
        };

        return o;
    }]);

app.controller('MainCtrl', ['$scope',
    function($scope) {
;
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
        auth.register = function(user) {
            return $http.post('/register', user).then(function(res) {
                auth.saveToken(res.data.token);
            });
        };
        auth.logIn = function(user) {
            return $http.post('/login', user).then(function(res) {
                auth.saveToken(res.data.token);
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
        $scope.logOut = function(){ auth.logOut().then(function() {
            $state.go('home');
        }).catch(function(error) {
            $scope.error = error;
        });}
    }
]);
app.controller('ProfileCtrl', ['$scope', '$state', 'todos', 'auth',
    function($scope, $state, todos) {
        $scope.todos =todos.todos;
        $scope.createTodo = function() {
            todos.createTodo($scope.todo).
                then(function() {
                    $state.go('profile');
                })
                .catch(function(error) {
                    $scope.error = error;
                });
        };

        $scope.getAll = function() {
            todos.getAll()
                .then(function (data) {
                    $scope.todos = data;
                    $state.go('profile');
                }).catch(function (error) {
                $scope.error = error;
            })
        };
    }]);
