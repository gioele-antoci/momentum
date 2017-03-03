var root = `https://jsonplaceholder.typicode.com/`;

type album = { userId: number; id: number; title: string };
type photo = { albumId: number; id: number; title: string; url: string; thumbnailUrl: string };
type post = { userId: number; id: number; title: string; body: string };
type comment = { postId: number; id?: number; name: string; email: string; body: string; };
type user = { id: number; name: string; username: string; email: string };

let users: user[] = [];
let posts: post[] = [];
let albums: album[] = [];
let photos: photo[] = [];
let comments: comment[] = [];

let authUser: user;

let pageRoot: JQuery;
let anonRoot: JQuery;
let authRoot: JQuery;

let switcher: JQuery;
let postsEl: JQuery;

let albumsContainer: JQuery;
let moreAlbumsButton: JQuery;

let postContainer: JQuery;
let postTitle: JQuery;
let postBody: JQuery;
let postCommentsButton: JQuery;

let albumContainer: JQuery;
let albumTitle: JQuery;
let photoEl: JQuery;
let photoImage: JQuery;
let morePhotoButton: JQuery;
let photoContainer: JQuery;

let albumTops = 3;
let albumSkip = 0;

let photoTops = 5;

const setup = () => {
    pageRoot = $(".root");
    anonRoot = $(".anon-root");
    authRoot = $(".auth-root");
    const form = $(".login-form");
    const input = $(".login-input");
    const logoutButton = $(".logout");

    logoutButton.click(e => {
        localStorage.removeItem("user");
        logout();
    });

    dialog.setupDialog();

    form.on("submit", e => {
        e.preventDefault();
        login(input.val());
    });

    switcher = $(".user-switcher");
    users.forEach(user => switcher.append($("<option></option>").attr("value", user.id).text(user.name)));
    switcher.on("change", e => {
        const id = (<HTMLOptionElement>e.target).value;
        changeUser(users.filter(x => x.id === parseInt(id))[0]);
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

    moreAlbumsButton = $(".more-albums").click(e => {
        albumSkip += albumTops;
        renderAlbums();
    });

    const localUser = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"));
    if (localUser) {
        login(localUser.username);
    }
};

class dialog {
    static dialogEl: JQuery;
    static textarea: JQuery;
    static postButton: JQuery;
    static commentContainer: JQuery;
    static closeDialogButton: JQuery;
    static commentBody: JQuery;
    static commentAuthor: JQuery;
    static commentEl: JQuery;

    private static postId: number;

    static setupDialog = () => {
        dialog.dialogEl = $(".dialog");
        dialog.textarea = $(".comment-textarea");
        dialog.postButton = $(".post-comment");
        dialog.commentContainer = $(".comment-container");
        dialog.closeDialogButton = $(".close-dialog");

        dialog.commentBody = $(".comment-body").detach();
        dialog.commentAuthor = $(".comment-author").detach();
        dialog.commentEl = $(".comment").detach();

        dialog.postButton.click(e => {
            const comm: comment = {
                postId: dialog.postId,
                body: dialog.textarea.val(),
                email: authUser.email,
                name: "This is a comment name"
            };

            $.ajax({
                url: `${root}posts`,
                method: "POST",
                data: JSON.stringify(comm)
            });
            dialog._renderComment(comm);
            dialog.textarea.val("");
            dialog.textarea.focusin().select();
        });

        dialog.dialogEl.click(e => {
            if ($(e.target).parents(`.${dialog.dialogEl.attr("class")}`).length === 0 || $(e.target).is(dialog.closeDialogButton)) {
                dialog.closeDialog();
            }
        });
    };

    static openDialog = () => {
        pageRoot.addClass("dialog-open");
        dialog.dialogEl.removeClass("hidden");
        dialog.textarea.focusin().select();
    };

    static closeDialog = () => {
        dialog.dialogEl.addClass("hidden");
        pageRoot.removeClass("dialog-open");
    };

    static renderComments = (postId: number) => {
        //comments
        authRoot.addClass("disable");
        const promiseComments = $.getJSON(`${root}comments?postId=${postId}`);
        promiseComments.done((data: comment[]) => {
            comments = data;
            dialog._renderComments(postId);
            authRoot.removeClass("disable");
        });
    };

    private static _renderComments = (postId: number) => {
        dialog.postId = postId;

        dialog.commentContainer.empty();
        comments.forEach(x => dialog._renderComment(x));
    };

    private static _renderComment = (comment: comment) => {
        const commentEl = dialog.commentEl.clone();
        commentEl.append(dialog.commentAuthor.clone().text(comment.email));
        commentEl.append(dialog.commentBody.clone().text(comment.body));
        dialog.commentContainer.append(commentEl);
    };
}

const requestUsers = () => {
    const promise = $.getJSON(`${root}users`);
    promise.done(data => {
        this.users = data;
    });

    return promise;
};

const login = (username: string) => {
    if (username) {
        const user = users.filter(x => x.username === username)[0];
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
            anonRoot.addClass("hidden");
            authRoot.removeClass("hidden");

            authUser = user;
            changeUser(user);
        }
    }
};

const logout = () => {
    anonRoot.removeClass("hidden");
    authRoot.addClass("hidden");
};

const changeUser = (user: user) => {
    if (user) {
        //reset
        albumSkip = 0;
        switcher.val(user.id);

        pageRoot.addClass("disable");

        //get albums
        const promiseAlbums = $.getJSON(`${root}albums?userId=${user.id}`);
        let promisePhotos;

        promiseAlbums.done((data: album[]) => {
            albums = data;
            //also get all the photos, this could be done in parallel to improve performance 
            //but shouldnt be done at 2am because bad things could happen
            // having promises.all would be sweet but es3 is shit
            promisePhotos = $.getJSON(`${root}photos?userId=${user.id}`)
            promisePhotos.done((photoData: photo[]) => {
                photos = photoData;
                albumsContainer.empty();
                renderAlbums();
            });
        });

        //posts
        const promisePosts = $.getJSON(`${root}posts?userId=${user.id}`);
        promisePosts.done((data: post[]) => {
            posts = data;
            renderPosts();
        });

        $.when(promisePosts, promiseAlbums, promisePosts).done(() => pageRoot.removeClass("disable"));
    }
};

const renderAlbums = () => {
    //let's not worry about top/skip being over the albums' length
    //for each album generate dom
    albums.slice(albumSkip, albumSkip + albumTops).forEach(album => {
        const albumEl = albumContainer.clone();
        albumEl.append(albumTitle.clone().text(album.title));

        const photoCont = photoContainer.clone();
        albumEl.append(photoCont);

        //render photos
        renderPhotos(photoCont, album.id);

        //attach scoped click handler 
        albumEl.append(morePhotoButton.clone().click((e) => ((el: JQuery, id: number) => {
            renderPhotos(el, id);
        })(photoCont, album.id)));

        //in the end append all
        albumsContainer.append(albumEl);
    });
};

const renderPhotos = (photoContainer: JQuery, albumId: number) => {
    const albumPhotos = photos.filter(x => x.albumId === albumId);

    const photoSkip = photoContainer.children().length;
    
    // let's not worry about tops/skips being higher than album's length
    //for each photo belonging to this album generate photo dom
    albumPhotos.slice(photoSkip, photoSkip + photoTops).forEach((albumPhoto: photo) => {
        const photoElement = photoEl.clone();
        photoElement.append(photoImage.clone().attr("src", albumPhoto.thumbnailUrl).attr("title", albumPhoto.title));
        photoContainer.append(photoElement);
    });

};

const renderPosts = () => {
    postsEl.empty();
    posts.forEach(post => {
        const postEl = postContainer.clone();
        postEl.append(postTitle.clone().text(post.title));
        postEl.append(postBody.clone().text(post.body));
        postEl.append(postCommentsButton.clone().click((e) => ((id) => openComments(id))(post.id)));
        postsEl.append(postEl);
    });
}

const openComments = (postId: number) => {
    dialog.renderComments(postId);
    dialog.openDialog();
};

$(document).ready(() => requestUsers().done(() => setup()));

//# sourceMappingURL=momentum.js.map