angular.module('flapperNews')
  .factory('posts', [
  '$http', 'auth', function($http, auth) {
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
