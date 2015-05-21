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

  $urlRouterProvider.otherwise('home')
}])

app.factory('posts', ['$http', function($http){
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

  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment)
  }

  o.upvoteComment = function(post, comment) {
    commentUrl = '/posts/' + post._id + '/comments/' + comment._id + '/upvote'
    return $http.put(commentUrl).success(function(data) {
      comment.upvotes += 1
    })
  }

  return o
}])

app.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){
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
'posts',
'resolvedPost',
function($scope, posts, fetchedPost){
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
}])