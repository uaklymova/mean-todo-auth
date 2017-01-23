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
                controller : 'AuthCtrl',
                // onEnter : ['$state', 'auth',
                //     function($state, auth) {
                //         if (auth.isLoggedIn()) {
                //             $state.go('profile');
                //         }
                //     }]
            })
            .state('register', {
                url : '/register',
                templateUrl : '/register.html',
                controller : 'AuthCtrl',
                // onEnter : ['$state', 'auth',
                //     function($state, auth) {
                //         if (auth.isLoggedIn()) {
                //             $state.go('profile');
                //         }
                //     }]
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
                            console.log(todos.getAll());
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
            // return $http.get('/users/'+id+'/todos', {
                headers: {Authorization: 'Bearer '+auth.getToken()}
            // }).then(function(res) {
            //     angular.copy(res.data, o.todos);
            }).then(function(res) {
                angular.copy(res, o.todos);
                console.log(o.todos);
            });
        };
        o.createTodo = function(todo) {
            return $http.post('/users/:user/todos', todo, {
                headers: {Authorization: 'Bearer '+auth.getToken()}
            }).then(function(data){
                console.log(auth.getToken);
                o.todos.push(data);
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
            console.log("isLoggedIn "+ token);

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };
        // auth.currentUser = function() {
        //     if (auth.isLoggedIn()) {
        //         var token = auth.getToken();
        //         var payload = JSON.parse($window.atob(token.split('.')[1]));
        //
        //         return payload.username;
        //     }
        // };
        auth.register = function(user) {
            return $http.post('/register', user).then(function(res) {
                auth.saveToken(res.data.token);
            });
        };
        auth.logIn = function(user) {
            return $http.post('/login', user).then(function(res) {
                console.log('fe - login token' + res.data.token);
                auth.saveToken(res.data.token);
            });
        };

        auth.logOut = function() {
            $window.localStorage.removeItem('appTodo');
        };

        // auth.getProfile = function () {
        //     return $http.get('/users/:user/todos', {
        //         headers: {
        //             Authorization: 'Bearer '+ auth.getToken()
        //         }
        //     });
        // };

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
                    console.log(data);
                    $scope.todos = data;
                    $state.go('profile');
                }).catch(function (error) {
                $scope.error = error;
            })
        };
    }]);
