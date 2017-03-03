var root = `http://jsonplaceholder.typicode.com/`;

type album = { userId: number; id: number; title: string };
type photo = { albumId: number; id: number; title: string; url: string; thumbnailUrl: string };
type post = { userId: number; id: number; title: string; body: string };
type comment = { postId: number; id: number; name: string; email: string; body: string; };
type user = { id: number; name: string; username: string };

let users: user[] = [];
let posts: post[] = [];
let albums: album[] = [];
let photos: photo[] = [];
let comments: comment[] = [];

let authUser: user;

let anonRoot: JQuery;
let authRoot: JQuery;

let switcher: JQuery;
let postsEl: JQuery;
let albumsContainer: JQuery;

let postContainer: JQuery;
let postTitle: JQuery;
let postBody: JQuery;
let postCommentsButton: JQuery;

let albumContainer: JQuery;
let albumTitle: JQuery;
let photoEl: JQuery;
let photoImage: JQuery;

let tops = 30;
let skip = 0;

const setup = () => {
    anonRoot = $(".anon-root");
    authRoot = $(".auth-root");
    const form = $(".login-form");
    const input = $(".login-input");

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
    albumTitle = $(".album-title").detach();
    albumContainer = $(".album-container").detach();
};

const requestUsers = () => {
    const promise = $.getJSON(`${root}users`);
    promise.done(data => {
        this.users = data;
    });

    return promise;
};

const login = (text) => {
    if (text) {
        const user = users.filter(x => x.username === text)[0];
        if (user) {
            anonRoot.addClass("hidden");
            authRoot.removeClass("hidden");

            authUser = user;
            changeUser(user);
        }
    }
};

const changeUser = (user: user) => {
    if (user) {
        switcher.val(user.id);

        //get albums
        const promiseAlbums = $.getJSON(`${root}albums`);
        promiseAlbums.done((data: album[]) => {
            albums = data;
            albumsContainer.empty();
            //also get all the photos, this could be done in parallel to improve performance 
            //but shouldnt be done at 2am because bad things could happen
            // having promises.all would be sweet but es3 is shit
            $.getJSON(`${root}photos`).done((photoData: photo[]) => {
                photos = photoData;

                //for each album generate dom
                albums.forEach(album => {
                    const albumEl = albumContainer.clone();
                    const albumPhotos = photos.filter(x => x.albumId === album.id);

                    albumEl.append(albumTitle.clone().text(album.title));

                    //for each photo belonging to this album generate photo dom
                    albumPhotos.forEach((albumPhoto: photo) => {
                        const photoElement = photoEl.clone();
                        photoElement.append(photoImage.clone().attr("src", albumPhoto.thumbnailUrl).attr("title", albumPhoto.title));
                        albumEl.append(photoElement);
                    });

                    //in the end append all
                    albumsContainer.append(albumEl);
                });
            });
        });

        //posts
        const promisePosts = $.getJSON(`${root}posts`);
        promisePosts.done((data: post[]) => {
            posts = data;
            postsEl.empty();
            posts.forEach(post => {
                const postEl = postContainer.clone();
                postEl.append(postTitle.clone().text(post.title));
                postEl.append(postBody.clone().text(post.body));
                postEl.append(postCommentsButton.clone().click((e) => {
                    ((id) => openComments(id))(post.id);
                }));
                postsEl.append(postEl);
            });
        });
    }
};

const openComments = (postId: number) => {


};

$(document).ready(() => requestUsers().done(() => setup()));

//# sourceMappingURL=momentum.js.map