var angular = require('angular')

angular.module('flapperNews')
  .controller('MainCtrl', [
  '$scope', 'posts', 'auth', function($scope, posts, auth) {

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
