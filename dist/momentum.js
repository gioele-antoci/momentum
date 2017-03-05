define("interfaces", ["require", "exports"], function (require, exports) {
    "use strict";
    ;
    ;
    ;
    ;
    ;
});
define("dialog", ["require", "exports"], function (require, exports) {
    "use strict";
    var dialog = (function () {
        function dialog() {
        }
        return dialog;
    }());
    dialog.comments = [];
    dialog.setup = function (manager) {
        dialog.manager = manager;
        dialog.dialogEl = $(".dialog");
        dialog.textarea = $(".comment-textarea");
        dialog.postButton = $(".post-comment");
        dialog.commentContainer = $(".comment-container");
        dialog.closeDialogButton = $(".close-dialog");
        dialog.commentBody = $(".comment-body").detach();
        dialog.commentAuthor = $(".comment-author").detach();
        dialog.commentEl = $(".comment").detach();
        dialog.postButton.click(function (e) {
            var comm = {
                postId: dialog.postId,
                body: dialog.textarea.val(),
                email: dialog.manager.authUser.email,
                name: "This is a comment name"
            };
            $.ajax({
                url: dialog.manager.root + "posts",
                method: "POST",
                data: JSON.stringify(comm)
            });
            dialog._renderComment(comm);
            dialog.textarea.val("");
            dialog.textarea.focusin().select();
        });
        dialog.dialogEl.click(function (e) {
            if ($(e.target).parents("." + dialog.dialogEl.attr("class")).length === 0 || $(e.target).is(dialog.closeDialogButton)) {
                dialog.closeDialog();
            }
        });
    };
    dialog.openDialog = function () {
        dialog.manager.pageRoot.addClass("dialog-open");
        dialog.dialogEl.removeClass("hidden");
        dialog.textarea.focusin().select();
    };
    dialog.closeDialog = function () {
        dialog.dialogEl.addClass("hidden");
        dialog.manager.pageRoot.removeClass("dialog-open");
    };
    dialog.renderComments = function (postId) {
        //comments
        dialog.manager.authRoot.addClass("disable");
        var promiseComments = $.getJSON(dialog.manager.root + "comments?postId=" + postId);
        promiseComments.done(function (data) {
            dialog.comments = data;
            dialog._renderComments(postId);
            dialog.manager.authRoot.removeClass("disable");
        });
    };
    dialog._renderComments = function (postId) {
        dialog.postId = postId;
        dialog.commentContainer.empty();
        dialog.comments.forEach(function (x) { return dialog._renderComment(x); });
    };
    dialog._renderComment = function (comment) {
        var commentEl = dialog.commentEl.clone();
        commentEl.append(dialog.commentAuthor.clone().text(comment.email));
        commentEl.append(dialog.commentBody.clone().text(comment.body));
        dialog.commentContainer.append(commentEl);
    };
    exports.__esModule = true;
    exports["default"] = dialog;
});
define("renderer", ["require", "exports", "dialog"], function (require, exports, dialog_1) {
    "use strict";
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
    var albumTops = 3;
    var albumSkip = 0;
    var photoTops = 5;
    var renderer = (function () {
        function renderer() {
        }
        renderer.setup = function (manager) {
            renderer.manager = manager;
            var form = $(".login-form");
            var input = $(".login-input");
            var logoutButton = $(".logout");
            logoutButton.click(function (e) {
                localStorage.removeItem("user");
                renderer.logout();
            });
            form.on("submit", function (e) {
                e.preventDefault();
                renderer.login(input.val());
            });
            switcher = $(".user-switcher");
            manager.users.forEach(function (user) { return switcher.append($("<option></option>").attr("value", user.id).text(user.name)); });
            switcher.on("change", function (e) {
                var id = e.target.value;
                renderer.changeUser(manager.users.filter(function (x) { return x.id === parseInt(id); })[0]);
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
                renderer.renderAlbums();
            });
            var localUser = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"));
            if (localUser) {
                renderer.login(localUser.username);
            }
        };
        ;
        renderer.logout = function () {
            renderer.manager.anonRoot.removeClass("hidden");
            renderer.manager.authRoot.addClass("hidden");
        };
        ;
        renderer.changeUser = function (user) {
            if (user) {
                //reset
                albumSkip = 0;
                switcher.val(user.id);
                renderer.manager.pageRoot.addClass("disable");
                //get albums
                var promiseAlbums = $.getJSON(renderer.manager.root + "albums?userId=" + user.id);
                var promisePhotos_1;
                promiseAlbums.done(function (data) {
                    renderer.manager.albums = data;
                    //also get all the photos, this could be done in parallel to improve performance 
                    //but shouldnt be done at 2am because bad things could happen
                    // having promises.all would be sweet but es3 is shit
                    promisePhotos_1 = $.getJSON(renderer.manager.root + "photos?userId=" + user.id);
                    promisePhotos_1.done(function (photoData) {
                        renderer.manager.photos = photoData;
                        albumsContainer.empty();
                        renderer.renderAlbums();
                    });
                });
                //posts
                var promisePosts = $.getJSON(renderer.manager.root + "posts?userId=" + user.id);
                promisePosts.done(function (data) {
                    renderer.manager.posts = data;
                    renderer.renderPosts();
                });
                $.when(promisePosts, promiseAlbums, promisePosts).done(function () { return renderer.manager.pageRoot.removeClass("disable"); });
            }
        };
        ;
        renderer.renderAlbums = function () {
            //let's not worry about top/skip being over the albums' length
            //for each album generate dom
            renderer.manager.albums.slice(albumSkip, albumSkip + albumTops).forEach(function (album) {
                var albumEl = albumContainer.clone();
                albumEl.append(albumTitle.clone().text(album.title));
                var photoCont = photoContainer.clone();
                albumEl.append(photoCont);
                //render photos
                renderer.renderPhotos(photoCont, album.id);
                //attach scoped click handler 
                albumEl.append(morePhotoButton.clone().click(function (e) { return (function (el, id) {
                    renderer.renderPhotos(el, id);
                })(photoCont, album.id); }));
                //in the end append all
                albumsContainer.append(albumEl);
            });
        };
        ;
        renderer.renderPhotos = function (photoContainer, albumId) {
            var albumPhotos = renderer.manager.photos.filter(function (x) { return x.albumId === albumId; });
            var photoSkip = photoContainer.children().length;
            // let's not worry about tops/skips being higher than album's length
            //for each photo belonging to this album generate photo dom
            albumPhotos.slice(photoSkip, photoSkip + photoTops).forEach(function (albumPhoto) {
                var photoElement = photoEl.clone();
                photoElement.append(photoImage.clone().attr("src", albumPhoto.thumbnailUrl).attr("title", albumPhoto.title));
                photoContainer.append(photoElement);
            });
        };
        ;
        renderer.renderPosts = function () {
            postsEl.empty();
            renderer.manager.posts.forEach(function (post) {
                var postEl = postContainer.clone();
                postEl.append(postTitle.clone().text(post.title));
                postEl.append(postBody.clone().text(post.body));
                postEl.append(postCommentsButton.clone().click(function (e) { return (function (id) { return renderer.openComments(id); })(post.id); }));
                postsEl.append(postEl);
            });
        };
        renderer.openComments = function (postId) {
            dialog_1["default"].renderComments(postId);
            dialog_1["default"].openDialog();
        };
        ;
        return renderer;
    }());
    renderer.login = function (username) {
        if (username) {
            var user = renderer.manager.users.filter(function (x) { return x.username === username; })[0];
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                renderer.manager.anonRoot.addClass("hidden");
                renderer.manager.authRoot.removeClass("hidden");
                renderer.manager.authUser = user;
                renderer.changeUser(user);
            }
        }
    };
    exports.renderer = renderer;
});
//# sourceMappingURL=momentum.js.map 
define("appManager", ["require", "exports", "renderer", "dialog"], function (require, exports, renderer_1, dialog_2) {
    "use strict";
    var appManager = (function () {
        function appManager() {
            var _this = this;
            this.root = "http://jsonplaceholder.typicode.com/";
            this.users = [];
            this.posts = [];
            this.albums = [];
            this.photos = [];
            $(document).ready(function () {
                _this.pageRoot = $(".root");
                _this.anonRoot = $(".anon-root");
                _this.authRoot = $(".auth-root");
                dialog_2["default"].setup(_this);
                _this.requestUsers().done(function () { return renderer_1.renderer.setup(_this); });
            });
        }
        appManager.prototype.requestUsers = function () {
            var _this = this;
            var promise = $.getJSON(this.root + "users");
            promise.done(function (data) {
                _this.users = data;
            });
            return promise;
        };
        ;
        return appManager;
    }());
    exports.appManager = appManager;
});
//# sourceMappingURL=momentum.js.map