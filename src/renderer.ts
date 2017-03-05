import { album, comment, photo, post, user, manager } from "./interfaces";
import dialog from "./dialog";

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

export class renderer {

    private static manager: manager;

    static setup(manager: manager): void {
        renderer.manager = manager;

        const form = $(".login-form");
        const input = $(".login-input");
        const logoutButton = $(".logout");

        logoutButton.click(e => {
            localStorage.removeItem("user");
            renderer.logout();
        });


        form.on("submit", e => {
            e.preventDefault();
            renderer.login(input.val());
        });

        switcher = $(".user-switcher");
        manager.users.forEach(user => switcher.append($("<option></option>").attr("value", user.id).text(user.name)));
        switcher.on("change", e => {
            const id = (<HTMLOptionElement>e.target).value;
            renderer.changeUser(manager.users.filter(x => x.id === parseInt(id))[0]);
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
            renderer.renderAlbums();
        });

        const localUser = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"));
        if (localUser) {
            renderer.login(localUser.username);
        }
    };

    static login = (username: string) => {
        if (username) {
            const user = renderer.manager.users.filter(x => x.username === username)[0];
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                renderer.manager.anonRoot.addClass("hidden");
                renderer.manager.authRoot.removeClass("hidden");

                renderer.manager.authUser = user;
                renderer.changeUser(user);
            }
        }
    };

    static logout() {
        renderer.manager.anonRoot.removeClass("hidden");
        renderer.manager.authRoot.addClass("hidden");
    };

    static changeUser(user: user) {
        if (user) {
            //reset
            albumSkip = 0;
            switcher.val(user.id);

            renderer.manager.pageRoot.addClass("disable");

            //get albums
            const promiseAlbums = $.getJSON(`${renderer.manager.root}albums?userId=${user.id}`);
            let promisePhotos;

            promiseAlbums.done((data: album[]) => {
                renderer.manager.albums = data;
                //also get all the photos, this could be done in parallel to improve performance 
                //but shouldnt be done at 2am because bad things could happen
                // having promises.all would be sweet but es3 is shit
                promisePhotos = $.getJSON(`${renderer.manager.root}photos?userId=${user.id}`)
                promisePhotos.done((photoData: photo[]) => {
                    renderer.manager.photos = photoData;
                    albumsContainer.empty();
                    renderer.renderAlbums();
                });
            });

            //posts
            const promisePosts = $.getJSON(`${renderer.manager.root}posts?userId=${user.id}`);
            promisePosts.done((data: post[]) => {
                renderer.manager.posts = data;
                renderer.renderPosts();
            });

            $.when(promisePosts, promiseAlbums, promisePosts).done(() => renderer.manager.pageRoot.removeClass("disable"));
        }
    };

    static renderAlbums() {
        //let's not worry about top/skip being over the albums' length
        //for each album generate dom
        renderer.manager.albums.slice(albumSkip, albumSkip + albumTops).forEach(album => {
            const albumEl = albumContainer.clone();
            albumEl.append(albumTitle.clone().text(album.title));

            const photoCont = photoContainer.clone();
            albumEl.append(photoCont);

            //render photos
            renderer.renderPhotos(photoCont, album.id);

            //attach scoped click handler 
            albumEl.append(morePhotoButton.clone().click((e) => ((el: JQuery, id: number) => {
                renderer.renderPhotos(el, id);
            })(photoCont, album.id)));

            //in the end append all
            albumsContainer.append(albumEl);
        });
    };

    static renderPhotos(photoContainer: JQuery, albumId: number) {
        const albumPhotos = renderer.manager.photos.filter(x => x.albumId === albumId);

        const photoSkip = photoContainer.children().length;

        // let's not worry about tops/skips being higher than album's length
        //for each photo belonging to this album generate photo dom
        albumPhotos.slice(photoSkip, photoSkip + photoTops).forEach((albumPhoto: photo) => {
            const photoElement = photoEl.clone();
            photoElement.append(photoImage.clone().attr("src", albumPhoto.thumbnailUrl).attr("title", albumPhoto.title));
            photoContainer.append(photoElement);
        });

    };

    static renderPosts() {
        postsEl.empty();
        renderer.manager.posts.forEach(post => {
            const postEl = postContainer.clone();
            postEl.append(postTitle.clone().text(post.title));
            postEl.append(postBody.clone().text(post.body));
            postEl.append(postCommentsButton.clone().click((e) => ((id) => renderer.openComments(id))(post.id)));
            postsEl.append(postEl);
        });
    }

    static openComments(postId: number) {
        dialog.renderComments(postId);
        dialog.openDialog();
    };
}


//# sourceMappingURL=momentum.js.map