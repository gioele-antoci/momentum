define("interfaces", ["require", "exports"], function (require, exports) {
    "use strict";
    ;
    ;
    ;
    ;
    ;
    var view;
    (function (view) {
        view[view["posts"] = 0] = "posts";
        view[view["albums"] = 1] = "albums";
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
            var val = dialog.textarea.val();
            dialog.textarea.toggleClass("validation-error", !val);
            if (!val) {
                dialog.textarea.attr("placeholder", "Please enter a comment");
                return;
            }
            dialog.textarea.attr("placeholder", "Add a comment");
            var comm = {
                postId: dialog.postId,
                body: val,
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
    var postContainer;
    var postTitle;
    var postBody;
    var postCommentsButton;
    var albumContainer;
    var albumTitle;
    var userSwitcher;
    var albumSwitcher;
    var renderer = (function () {
        function renderer() {
        }
        renderer.setup = function () {
            postsEl = $(".posts");
            albumsContainer = $(".albums-container");
            albumSwitcher = $(".album-switcher");
            //the following order matters, from deepest to least deep in dom tree
            postTitle = $(".post-title").detach();
            postBody = $(".post-body").detach();
            postCommentsButton = $(".post-comments-button").detach();
            postContainer = $(".post-container").detach();
            albumTitle = $(".album-title").detach();
            albumContainer = $(".album-container").detach();
            userSwitcher = $(".user-switcher");
            albumSwitcher = $(".album-switcher");
        };
        renderer.renderUserSwitcher = function (users) {
            users.forEach(function (user) { return userSwitcher.append($("<option></option>").attr("value", user.id).text(user.name)); });
        };
        renderer.renderAlbumSwitcher = function (albums) {
            albumSwitcher.empty();
            albums.forEach(function (album) { return albumSwitcher.append($("<option></option>").attr("value", album.id).text(album.title)); });
        };
        renderer.renderAlbum = function (album, albumPhotos) {
            albumsContainer.empty();
            //set album title
            var albumEl = albumContainer.clone();
            albumEl.append(albumTitle.clone().text(album.title));
            var photoCont = $(".photo-container", albumEl);
            //set unique id for carousel and its controls
            var id = "album" + album.id;
            photoCont.attr("id", id);
            $(".carousel-control", photoCont).attr("href", "#" + id);
            //add to dom
            albumEl.append(photoCont);
            //render photos inside carousel
            renderer.renderPhotos(albumPhotos, photoCont, album.id);
            //in the end append all
            albumsContainer.append(albumEl);
        };
        renderer.renderPhotos = function (photos, photoContainer, albumId) {
            //get photos for this album only
            var albumPhotos = photos.filter(function (x) { return x.albumId === albumId; });
            var carouselInner = $(".carousel-inner", photoContainer);
            var photoElTemplate = $(".photo.item", carouselInner).detach();
            albumPhotos.forEach(function (photo) {
                var photoEl = photoElTemplate.clone();
                //add image
                var photoImage = $(".photo-image", photoEl);
                photoImage.attr("src", photo.url.replace("http://", document.location.protocol + "//")).attr("title", photo.title);
                //add caption
                var photoCaption = $(".carousel-caption", photoEl);
                photoCaption.text(photo.title);
                carouselInner.append(photoEl);
            });
            //mark first image as active
            $(".item", carouselInner).first().addClass("active");
        };
        renderer.renderPosts = function (posts) {
            postsEl.empty();
            posts.forEach(function (post) {
                var postEl = postContainer.clone();
                postEl.append(postTitle.clone().text(post.title));
                postEl.append(postBody.clone().text(post.body));
                postEl.append(postCommentsButton.clone().click(function (e) { return (function (id) { return renderer.openComments(id); })(post.id); }));
                postsEl.append(postEl);
            });
        };
        renderer.openComments = function (postId) {
            dialog_1["default"].renderComments(postId);
            // dom breather
            setTimeout(function () { return dialog_1["default"].openDialog(); });
        };
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
            pageSwitcher.navPosts = $(".nav-posts").click(function (e) { return _this.changeView(interfaces_1.view.posts); });
            pageSwitcher.navAlbums = $(".nav-albums").click(function (e) { return _this.changeView(interfaces_1.view.albums); });
            pageSwitcher.postsView = $(".posts-view");
            pageSwitcher.albumsView = $(".albums-view");
            this.changeView(interfaces_1.view.posts);
        };
        pageSwitcher.changeView = function (viewToActivate) {
            if (typeof this.activeView !== "undefined") {
                this.activeViewEl.addClass("hidden");
                switch (this.activeView) {
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
            $(document).ready(function () {
                _this.setup();
                dialog_2["default"].setup(_this);
                pageSwitcher_1["default"].setup(_this);
                _this.requestUsers().done(function () {
                    renderer_1.renderer.setup();
                    renderer_1.renderer.renderUserSwitcher(_this.users);
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
            this.logoutButton = $(".nav-logout");
            this.progress = $(".progress-momentum");
            this.logoutButton.click(function (e) { return _this.logout(); });
            this.form.on("submit", function (e) {
                e.preventDefault();
                _this.checkAuthentication(_this.input.val());
            });
            this.userSwitcher = $(".user-switcher");
            this.userSwitcher.on("change", function (e) {
                var id = e.target.value;
                _this.changeUser(_this.users.filter(function (x) { return x.id === parseInt(id); })[0]);
            });
            this.albumSwitcher = $(".album-switcher");
            this.albumSwitcher.on("change", function (e) {
                var id = e.target.value;
                _this.changeAlbum(_this.albums.filter(function (x) { return x.id === parseInt(id); })[0]);
            });
            var checkWidth = function () {
                var width = $(window).width();
                _this.pageRoot.toggleClass("small", width < 768);
                setTimeout(function () { return resizeListener(); }, 100); //rebinds itself after 100ms;
            };
            var resizeListener = function () {
                $(window).one("resize", function () {
                    checkWidth();
                });
            };
            resizeListener();
            checkWidth();
        };
        appManager.prototype.toggleSpinner = function (visible) {
            this.progress.toggleClass("hidden", !visible);
        };
        appManager.prototype.requestUsers = function () {
            var _this = this;
            this.toggleSpinner(true);
            var promise = $.getJSON(this.root + "users");
            promise.done(function (data) {
                _this.users = data;
                _this.toggleSpinner(false);
            });
            return promise;
        };
        appManager.prototype.autologin = function () {
            var localUser = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"));
            this.checkAuthentication(localUser || null);
        };
        appManager.prototype.checkAuthentication = function (username) {
            if (username === void 0) { username = ""; }
            var user = null;
            if (username) {
                user = this.users.filter(function (x) { return x.username === username; })[0];
                if (user) {
                    localStorage.setItem("user", JSON.stringify(user));
                    this.authUser = user;
                    this.changeUser(user);
                    this.input.removeClass("validation-error");
                    this.input.attr("placeholder", "Enter your username");
                }
                else {
                    this.input.addClass("validation-error");
                    this.input.attr("placeholder", "Username not found");
                }
            }
            else if (username !== null) {
                this.input.addClass("validation-error");
            }
            this.anonRoot.toggleClass("hidden", !!user);
            this.authRoot.toggleClass("hidden", !user);
        };
        appManager.prototype.logout = function () {
            localStorage.removeItem("user");
            this.checkAuthentication();
        };
        appManager.prototype.changeUser = function (user) {
            var _this = this;
            if (user) {
                //reset
                this.userSwitcher.val(user.id);
                this.toggleSpinner(true);
                //get albums
                var promiseAlbums = $.getJSON(this.root + "albums?userId=" + user.id);
                var promisePhotos_1;
                promiseAlbums.done(function (data) {
                    _this.albums = data;
                    renderer_1.renderer.renderAlbumSwitcher(_this.albums);
                    //also get all the photos, this could be done in parallel to improve performance 
                    //but shouldnt be done at 2am because bad things could happen
                    // having promises.all would be sweet but es3 is shit
                    promisePhotos_1 = $.getJSON(_this.root + "photos?userId=" + user.id);
                    promisePhotos_1.done(function (photoData) {
                        _this.photos = photoData;
                        renderer_1.renderer.renderAlbum(_this.albums[0], _this.getPhotosForAlbum(_this.albums[0].id));
                    });
                });
                //posts
                var promisePosts = $.getJSON(this.root + "posts?userId=" + user.id);
                promisePosts.done(function (data) {
                    _this.posts = data;
                    renderer_1.renderer.renderPosts(_this.posts);
                });
                $.when(promisePosts, promiseAlbums, promisePosts).done(function () { return _this.toggleSpinner(false); });
            }
        };
        appManager.prototype.changeAlbum = function (album) {
            renderer_1.renderer.renderAlbum(album, this.getPhotosForAlbum(album.id));
        };
        appManager.prototype.getPhotosForAlbum = function (albumId) {
            return this.photos.filter(function (x) { return x.albumId === albumId; });
        };
        return appManager;
    }());
    exports.appManager = appManager;
});
//# sourceMappingURL=momentum.js.map