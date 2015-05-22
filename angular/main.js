var angular = require('angular')

var dependencies = [
'ui.router'
]

var app = angular.module('flapperNews', dependencies)

// load all the modules after app is declared
require('angular-ui-router')
require('./controllers/_index')
require('./factories/_index')

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postsPromise: ['posts', function(posts) {
          return posts.getAll()
        }]
      }
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl',
      resolve: {
        resolvedPost: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id)
        }]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if (auth.isLoggedIn()) {
          $state.go('home')
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if (auth.isLoggedIn()) {
          $state.go('home')
        }
      }]
    })

  $urlRouterProvider.otherwise('home')
})
