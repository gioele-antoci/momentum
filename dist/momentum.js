var _this = this;
var root = "http://jsonplaceholder.typicode.com/";
var users = [];
var posts = [];
var albums = [];
var photos = [];
var comments = [];
var authUser;
var anonRoot;
var authRoot;
var switcher;
var postsEl;
var albumsContainer;
var postContainer;
var postTitle;
var postBody;
var postCommentsButton;
var albumContainer;
var albumTitle;
var photoEl;
var photoImage;
var tops = 30;
var skip = 0;
var setup = function () {
    anonRoot = $(".anon-root");
    authRoot = $(".auth-root");
    var form = $(".login-form");
    var input = $(".login-input");
    form.on("submit", function (e) {
        e.preventDefault();
        login(input.val());
    });
    switcher = $(".user-switcher");
    users.forEach(function (user) { return switcher.append($("<option></option>").attr("value", user.id).text(user.name)); });
    switcher.on("change", function (e) {
        var id = e.target.value;
        changeUser(users.filter(function (x) { return x.id === parseInt(id); })[0]);
    });
    postsEl = $(".posts");
    albumsContainer = $(".albums-container");
    //the following order matters, from deepest to least deep in dom tree
    postTitle = $(".post-title").detach();
    postBody = $(".post-body").detach();
    postCommentsButton = $(".post-comments-button").detach();
    postContainer = $(".post-container").detach();
    photoImage = $(".photo-image").detach();
    photoEl = $(".photo").detach();
    albumTitle = $(".album-title").detach();
    albumContainer = $(".album-container").detach();
};
var requestUsers = function () {
    var promise = $.getJSON(root + "users");
    promise.done(function (data) {
        _this.users = data;
    });
    return promise;
};
var login = function (text) {
    if (text) {
        var user = users.filter(function (x) { return x.username === text; })[0];
        if (user) {
            anonRoot.addClass("hidden");
            authRoot.removeClass("hidden");
            authUser = user;
            changeUser(user);
        }
    }
};
var changeUser = function (user) {
    if (user) {
        switcher.val(user.id);
        //get albums
        var promiseAlbums = $.getJSON(root + "albums");
        promiseAlbums.done(function (data) {
            albums = data;
            albumsContainer.empty();
            //also get all the photos, this could be done in parallel to improve performance 
            //but shouldnt be done at 2am because bad things could happen
            // having promises.all would be sweet but es3 is shit
            $.getJSON(root + "photos").done(function (photoData) {
                photos = photoData;
                //for each album generate dom
                albums.forEach(function (album) {
                    var albumEl = albumContainer.clone();
                    var albumPhotos = photos.filter(function (x) { return x.albumId === album.id; });
                    albumEl.append(albumTitle.clone().text(album.title));
                    //for each photo belonging to this album generate photo dom
                    albumPhotos.forEach(function (albumPhoto) {
                        var photoElement = photoEl.clone();
                        photoElement.append(photoImage.clone().attr("src", albumPhoto.thumbnailUrl).attr("title", albumPhoto.title));
                        albumEl.append(photoElement);
                    });
                    //in the end append all
                    albumsContainer.append(albumEl);
                });
            });
        });
        //posts
        var promisePosts = $.getJSON(root + "posts");
        promisePosts.done(function (data) {
            posts = data;
            postsEl.empty();
            posts.forEach(function (post) {
                var postEl = postContainer.clone();
                postEl.append(postTitle.clone().text(post.title));
                postEl.append(postBody.clone().text(post.body));
                postEl.append(postCommentsButton.clone().click(function (e) {
                    (function (id) { return openComments(id); })(post.id);
                }));
                postsEl.append(postEl);
            });
        });
    }
};
var openComments = function (postId) {
};
$(document).ready(function () { return requestUsers().done(function () { return setup(); }); });
//# sourceMappingURL=momentum.js.map 
//# sourceMappingURL=momentum.js.map