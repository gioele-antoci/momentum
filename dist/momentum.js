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
var moreAlbumsButton;
var postContainer;
var postTitle;
var postBody;
var postCommentsButton;
var albumContainer;
var albumTitle;
var photoEl;
var photoImage;
var morePhotoButton;
var photoContainer;
var albumTops = 10;
var albumSkip = 0;
var photoTops = 5;
var photoSkip = 0;
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
    morePhotoButton = $(".more-photos").detach();
    photoContainer = $(".photo-container").detach();
    albumTitle = $(".album-title").detach();
    albumContainer = $(".album-container").detach();
    moreAlbumsButton = $(".more-albums").click(function (e) {
        albumSkip += albumTops;
        renderAlbums();
    });
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
        //reset
        albumSkip = 0;
        photoSkip = 0;
        switcher.val(user.id);
        authRoot.addClass("disable");
        //get albums
        var promiseAlbums = $.getJSON(root + "albums?userId=" + user.id);
        var promisePhotos_1;
        promiseAlbums.done(function (data) {
            albums = data;
            //also get all the photos, this could be done in parallel to improve performance 
            //but shouldnt be done at 2am because bad things could happen
            // having promises.all would be sweet but es3 is shit
            promisePhotos_1 = $.getJSON(root + "photos?userId=" + user.id);
            promisePhotos_1.done(function (photoData) {
                photos = photoData;
                albumsContainer.empty();
                renderAlbums();
            });
        });
        //posts
        var promisePosts = $.getJSON(root + "posts?userId=" + user.id);
        promisePosts.done(function (data) {
            posts = data;
            renderPosts();
        });
        $.when(promisePosts, promiseAlbums, promisePosts).done(function () { return authRoot.removeClass("disable"); });
    }
};
var renderAlbums = function () {
    //let's not worry about top/skip being over the albums' length
    //for each album generate dom
    albums.slice(albumSkip, albumSkip + albumTops).forEach(function (album) {
        var albumEl = albumContainer.clone();
        albumEl.append(albumTitle.clone().text(album.title));
        var photoCont = photoContainer.clone();
        albumEl.append(photoCont);
        //render photos
        renderPhotos(photoCont, album.id);
        //attach scoped click handler 
        albumEl.append(morePhotoButton.clone().click(function (e) { return (function (el, id) {
            photoSkip += photoTops;
            renderPhotos(el, id);
        })(photoCont, album.id); }));
        //in the end append all
        albumsContainer.append(albumEl);
    });
};
var renderPhotos = function (photoContainer, albumId) {
    var albumPhotos = photos.filter(function (x) { return x.albumId === albumId; });
    // let's not worry about tops/skips being higher than album's length
    //for each photo belonging to this album generate photo dom
    albumPhotos.slice(photoSkip, photoSkip + photoTops).forEach(function (albumPhoto) {
        var photoElement = photoEl.clone();
        photoElement.append(photoImage.clone().attr("src", albumPhoto.thumbnailUrl).attr("title", albumPhoto.title));
        photoContainer.append(photoElement);
    });
};
var renderPosts = function () {
    postsEl.empty();
    posts.forEach(function (post) {
        var postEl = postContainer.clone();
        postEl.append(postTitle.clone().text(post.title));
        postEl.append(postBody.clone().text(post.body));
        postEl.append(postCommentsButton.clone().click(function (e) { return (function (id) { return openComments(id); })(post.id); }));
        postsEl.append(postEl);
    });
};
var openComments = function (postId) {
    console.log(postId);
};
$(document).ready(function () { return requestUsers().done(function () { return setup(); }); });
//# sourceMappingURL=momentum.js.map 
//# sourceMappingURL=momentum.js.map