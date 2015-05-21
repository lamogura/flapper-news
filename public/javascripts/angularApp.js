var app = angular.module('flapperNews', ['ui.router'])

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider){
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
}])

app.factory('auth', ['$http', '$window', function($http, $window) {
  var auth = {}

  auth.saveToken = function(token) {
    $window.localStorage['flapper-news-token'] = token
  }

  auth.getToken = function() {
    return $window.localStorage['flapper-news-token']
  }

  auth.isLoggedIn = function() {
    var token = auth.getToken()

    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]))
      return payload.exp > Date.now() / 1000
    }

    return false
  }

  auth.currentUser = function() {
    if (auth.isLoggedIn()) {
      var token = auth.getToken()
      var payload = JSON.parse($window.atob(token.split('.')[1]))

      return payload.username
    }
  }

  auth.register = function(user) {
    return $http.post('/register', user).success(function(data) {
      auth.saveToken(data.token)
    })
  }

  auth.logIn = function(user) {
    return $http.post('/login', user).success(function(data) {
      auth.saveToken(data.token)
    })
  }

  auth.logOut = function() {
    $window.localStorage.removeItem('flapper-news-token')
  }

  return auth
}])

app.factory('posts', ['$http', 'auth', function($http, auth){
  var o = {
    posts: []
  }

  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res) {
      return res.data
    })
  }

  o.getAll = function() {
    return $http.get('/posts').success(function(posts) {
      angular.copy(posts, o.posts)
    })
  }

  // auth required
  o.create = function(post) {
    var opts = {headers: {Authorization: 'Bearer ' + auth.getToken()}}
    return $http.post('/posts', post, opts).success(function(newPost) {
      o.posts.push(newPost)
    })
  }

  o.upvote = function(post) {
    var upvoteUrl = '/posts/' + post._id + '/upvote'
    var opts = {headers: {Authorization: 'Bearer ' + auth.getToken()}}
    return $http.put(upvoteUrl, null, opts).success(function(data) {
      post.upvotes += 1
    })
  }

  o.addComment = function(id, comment) {
    var opts = {headers: {Authorization: 'Bearer ' + auth.getToken()}}
    return $http.post('/posts/' + id + '/comments', comment, opts)
  }

  o.upvoteComment = function(post, comment) {
    var opts = {headers: {Authorization: 'Bearer ' + auth.getToken()}}
    commentUrl = '/posts/' + post._id + '/comments/' + comment._id + '/upvote'
    return $http.put(commentUrl, null, opts).success(function(data) {
      comment.upvotes += 1
    })
  }

  return o
}])

app.controller('MainCtrl', [
'$scope',
'posts',
'auth',
function($scope, posts, auth){
  $scope.posts = posts.posts

  $scope.incrementUpvotes = function(post){
    posts.upvote(post)
  }

  $scope.addPost = function(){
    if (!$scope.title || $scope.title === '') return

    posts.create({
      title: $scope.title,
      link: $scope.link
    })
    $scope.title = ''
    $scope.link = ''
  }

  $scope.isLoggedIn = auth.isLoggedIn
}])

app.controller('PostsCtrl', [
'$scope',
'posts',
'resolvedPost',
'auth',
function($scope, posts, fetchedPost, auth){
  $scope.post = fetchedPost

  $scope.addComment = function(){
    if (!$scope.body || $scope.body === '') return

    posts.addComment($scope.post._id, {
      body: $scope.body,
      author: 'user',
      upvotes: 0
    }).success(function(comment) {
      $scope.post.comments.push(comment)
    })

    $scope.body = ''
  }

  $scope.incrementUpvotes = function(comment) {
    posts.upvoteComment($scope.post, comment)
  }

  $scope.isLoggedIn = auth.isLoggedIn
}])

app.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth) {
  $scope.user = {}

  $scope.register = function() {
    auth.register($scope.user)
      .error(function(err) {
        $scope.error = err;
      })
      .then(function() {
        $state.go('home')
      })
  }

  $scope.logIn = function() {
    auth.logIn($scope.user)
      .error(function(err) {
        $scope.error = err
      })
      .then(function() {
        $state.go('home')
      })
  }
}
])

app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth) {
  $scope.isLoggedIn = auth.isLoggedIn
  $scope.currentUser = auth.currentUser
  $scope.logOut = auth.logOut
}])