var app = angular.module('meanApp', []);

app.config(['$routeProvider', '$locationProvider'],
    function ($routeProvider, $locationProvider){
        $routeProvider
        .when('/', {
            templateUrl: 'home/home.view.html',
            controller: 'homeCtrl',
            controllerAs: 'vm'
        })
        .when('/register', {
            templateUrl: '../views/register.view.html',
            controller: 'registerCtrl',
            controllerAs: 'vm'
        })
        .when('/login', {
            templateUrl: '/auth/login/login.view.html',
            controller: 'loginCtrl',
            controllerAs: 'vm'
        })
        .when('/profile', {
            templateUrl: '../views/profile.view.html',
            controller: 'profileCtrl',
            controllerAs: 'vm'
        })
        .otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
});



// Todo service
// each function returns a promise object 
app.factory('Todos', ['$http',function($http) {
    return {
        get : function() {
            return $http.get('/users/:user/todos');
        },
        create : function(todoData) {
            return $http.post('/users/:user/todos', todoData);
        },
        delete : function(id) {
            return $http.delete('/users/:user/todos' + id);
        }
    }
}]);

app.controller('mainController', ['$scope','$http','Todos', function($scope, $http, Todos) {
    $scope.formData = {};
    $scope.loading = true;

    // GET =====================================================================
    // when landing on the page, get all todos and show them
    Todos.get()
        .success(function(data) {
            $scope.todos = data;
            $scope.loading = false;
        });

    // CREATE ==================================================================
    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {

        // validate the formData to make sure that something is there
        // if form is empty, nothing will happen
        if ($scope.formData.text != undefined) {
            $scope.loading = true;

            // call the create function from our service (returns a promise object)
            Todos.create($scope.formData)

                // if successful creation, call our get function to get all the new todos
                .success(function(data) {
                    $scope.loading = false;
                    $scope.formData = {}; // clear the form so our user is ready to enter another
                    $scope.todos = data; // assign our new list of todos
                });
        }
    };

    // DELETE ==================================================================
    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $scope.loading = true;

        Todos.delete(id)
            // if successful creation, call our get function to get all the new todos
            .success(function(data) {
                $scope.loading = false;
                $scope.todos = data; // assign our new list of todos
            });
    };
}]);

app.controller('registerCtrl',  ['$location', 'authentication'], function registerCtrl($location, authentication) {
    var vm = this;

    vm.credentials = {
        username : "",
        password : ""
    };

    vm.onSubmit = function () {
        console.log('Submitting registration');
        authentication
            .register(vm.credentials)
            .error(function(err){
                alert(err);
            })
            .then(function(){
                $location.path('profile');
            });
    };
});

app.controller('loginCtrl', ['$location', 'authentication'], function loginCtrl($location, authentication) {
    var vm = this;

    vm.credentials = {
        user: "",
        password: ""
    };

    vm.onSubmit = function () {
        authentication
            .login(vm.credentials)
            .error(function (err) {
                alert(err);
            })
            .then(function () {
                $location.path('profile');
            });
    };
});

app.controller('profileCtrl', ['$location', 'meanData'],
function profileCtrl($location, meanData) {
    var vm = this;

    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
        })
        .error(function (e) {
            console.log(e);
        });
});