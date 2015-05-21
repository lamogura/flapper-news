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
        postPromise: ['posts', function(posts) {
          return posts.getAll()
        }]
      }
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl'
    })

  $urlRouterProvider.otherwise('home')
}])

app.factory('posts', ['$http', function($http){
  var o = {
    posts: []
  }

  o.getAll = function() {
    return $http.get('/posts').success(function(posts) {
      angular.copy(posts, o.posts)
    })
  }

  o.create = function(post) {
    return $http.post('/posts', post).success(function(newPost) {
      o.posts.push(newPost)
    })
  }

  o.upvote = function(post) {
    var upvoteUrl = '/posts/' + post._id + '/upvote'
    return $http.put(upvoteUrl).success(function(data) {
      post.upvotes += 1
    })
  }

  return o
}])

app.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){
  $scope.test = 'Hello World'
  
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
}])

app.controller('PostsCtrl', [
'$scope',
'$stateParams',
'posts',
function($scope, $stateParams, posts){
  $scope.post = posts.posts[$stateParams.id]

  $scope.addComment = function(){
    if (!$scope.body || $scope.body === '') return
    $scope.post.comments.push({
      body: $scope.body,
      author: 'user',
      upvotes: 0
    })
    $scope.body = ''
  }
}])