angular.module('flapperNews')
  .controller('PostsCtrl', [
  '$scope', 'posts', 'resolvedPost', 'auth', function($scope, posts, fetchedPost, auth) {

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
