define("interfaces", ["require", "exports"], function (require, exports) {
    "use strict";
    ;
    ;
    ;
    ;
    ;
    var view;
    (function (view) {
        view[view["users"] = 0] = "users";
        view[view["posts"] = 1] = "posts";
        view[view["albums"] = 2] = "albums";
    })(view = exports.view || (exports.view = {}));
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
    };
    dialog.openDialog = function () {
        dialog.dialogEl.modal("show");
        dialog.textarea.focusin().select();
    };
    dialog.closeDialog = function () {
        dialog.dialogEl.modal("hide");
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
    var renderer = (function () {
        function renderer() {
        }
        renderer.setup = function (manager) {
            renderer.manager = manager;
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
                renderer.manager.albumSkip += renderer.manager.albumTops;
                renderer.renderAlbums();
            });
        };
        ;
        renderer.renderAlbums = function (clean) {
            if (clean === void 0) { clean = false; }
            if (clean) {
                albumsContainer.empty();
            }
            //let's not worry about top/skip being over the albums' length
            //for each album generate dom
            renderer.manager.albums.slice(renderer.manager.albumSkip, renderer.manager.albumSkip + renderer.manager.albumTops)
                .forEach(function (album) {
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
            albumPhotos.slice(photoSkip, photoSkip + renderer.manager.photoTops)
                .forEach(function (albumPhoto) {
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
    exports.renderer = renderer;
});
//# sourceMappingURL=momentum.js.map 
define("pageSwitcher", ["require", "exports", "interfaces"], function (require, exports, interfaces_1) {
    "use strict";
    var pageSwitcher = (function () {
        function pageSwitcher() {
        }
        pageSwitcher.setup = function (manager) {
            var _this = this;
            pageSwitcher.manager = manager;
            pageSwitcher.pageHeader = $(".page-header");
            pageSwitcher.navUsers = $(".nav-users").click(function (e) { return _this.changeView(interfaces_1.view.users); });
            pageSwitcher.navPosts = $(".nav-posts").click(function (e) { return _this.changeView(interfaces_1.view.posts); });
            pageSwitcher.navAlbums = $(".nav-albums").click(function (e) { return _this.changeView(interfaces_1.view.albums); });
            pageSwitcher.usersView = $(".users-view");
            pageSwitcher.postsView = $(".posts-view");
            pageSwitcher.albumsView = $(".albums-view");
            this.changeView(interfaces_1.view.posts);
        };
        pageSwitcher.changeView = function (viewToActivate) {
            if (typeof this.activeView !== "undefined") {
                this.activeViewEl.addClass("hidden");
                switch (this.activeView) {
                    case interfaces_1.view.users:
                        this.navUsers.removeClass("active");
                        break;
                    case interfaces_1.view.posts:
                        this.navPosts.removeClass("active");
                        break;
                    case interfaces_1.view.albums:
                        this.navAlbums.removeClass("active");
                        break;
                }
            }
            this.activeView = viewToActivate;
            switch (this.activeView) {
                case interfaces_1.view.users:
                    this.activeViewEl = this.usersView.removeClass("hidden");
                    this.pageHeader.text("Users");
                    this.navUsers.addClass("active");
                    break;
                case interfaces_1.view.posts:
                    this.activeViewEl = this.postsView.removeClass("hidden");
                    this.pageHeader.text("Posts");
                    this.navPosts.addClass("active");
                    break;
                case interfaces_1.view.albums:
                    this.activeViewEl = this.albumsView.removeClass("hidden");
                    this.pageHeader.text("Albums");
                    this.navAlbums.addClass("active");
                    break;
            }
        };
        return pageSwitcher;
    }());
    exports.__esModule = true;
    exports["default"] = pageSwitcher;
});
define("appManager", ["require", "exports", "renderer", "dialog", "pageSwitcher"], function (require, exports, renderer_1, dialog_2, pageSwitcher_1) {
    "use strict";
    var appManager = (function () {
        function appManager() {
            var _this = this;
            this.root = document.location.protocol + "//jsonplaceholder.typicode.com/";
            this.users = [];
            this.posts = [];
            this.albums = [];
            this.photos = [];
            this.albumTops = 3;
            this.albumSkip = 0;
            this.photoTops = 5;
            $(document).ready(function () {
                _this.setup();
                dialog_2["default"].setup(_this);
                pageSwitcher_1["default"].setup(_this);
                _this.requestUsers().done(function () {
                    renderer_1.renderer.setup(_this);
                    _this.autologin();
                });
            });
        }
        appManager.prototype.setup = function () {
            var _this = this;
            this.pageRoot = $(".root");
            this.anonRoot = $(".anon-root");
            this.authRoot = $(".auth-root");
            this.form = $(".login-form");
            this.input = $(".login-input");
            this.logoutButton = $(".logout");
            this.logoutButton.click(function (e) {
                _this.logout();
            });
            this.form.on("submit", function (e) {
                e.preventDefault();
                _this.login(_this.input.val());
            });
            this.switcher = $(".user-switcher");
            this.switcher.on("change", function (e) {
                var id = e.target.value;
                _this.changeUser(_this.users.filter(function (x) { return x.id === parseInt(id); })[0]);
            });
        };
        appManager.prototype.requestUsers = function () {
            var _this = this;
            var promise = $.getJSON(this.root + "users");
            promise.done(function (data) {
                _this.users = data;
                _this.users.forEach(function (user) { return _this.switcher.append($("<option></option>").attr("value", user.id).text(user.name)); });
            });
            return promise;
        };
        appManager.prototype.autologin = function () {
            var localUser = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"));
            if (localUser) {
                this.login(localUser.username);
            }
        };
        appManager.prototype.login = function (username) {
            if (username) {
                var user = this.users.filter(function (x) { return x.username === username; })[0];
                if (user) {
                    localStorage.setItem("user", JSON.stringify(user));
                    this.anonRoot.addClass("hidden");
                    this.authRoot.removeClass("hidden");
                    this.authUser = user;
                    this.changeUser(user);
                }
            }
        };
        appManager.prototype.logout = function () {
            localStorage.removeItem("user");
            this.anonRoot.removeClass("hidden");
            this.authRoot.addClass("hidden");
        };
        appManager.prototype.changeUser = function (user) {
            var _this = this;
            if (user) {
                //reset
                this.albumSkip = 0;
                this.switcher.val(user.id);
                this.pageRoot.addClass("disable");
                //get albums
                var promiseAlbums = $.getJSON(this.root + "albums?userId=" + user.id);
                var promisePhotos_1;
                promiseAlbums.done(function (data) {
                    _this.albums = data;
                    //also get all the photos, this could be done in parallel to improve performance 
                    //but shouldnt be done at 2am because bad things could happen
                    // having promises.all would be sweet but es3 is shit
                    promisePhotos_1 = $.getJSON(_this.root + "photos?userId=" + user.id);
                    promisePhotos_1.done(function (photoData) {
                        _this.photos = photoData;
                        renderer_1.renderer.renderAlbums(true);
                    });
                });
                //posts
                var promisePosts = $.getJSON(this.root + "posts?userId=" + user.id);
                promisePosts.done(function (data) {
                    _this.posts = data;
                    renderer_1.renderer.renderPosts();
                });
                $.when(promisePosts, promiseAlbums, promisePosts).done(function () { return _this.pageRoot.removeClass("disable"); });
            }
        };
        return appManager;
    }());
    exports.appManager = appManager;
});
//# sourceMappingURL=momentum.js.map