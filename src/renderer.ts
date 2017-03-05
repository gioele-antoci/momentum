import { album, comment, photo, post, user, manager } from "./interfaces";
import dialog from "./dialog";

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


export class renderer {

    private static manager: manager;

    static setup(manager: manager): void {
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

        moreAlbumsButton = $(".more-albums").click(e => {
            renderer.manager.albumSkip += renderer.manager.albumTops;
            renderer.renderAlbums();
        });

    };

    static renderAlbums(clean = false) {

        if (clean) {
            albumsContainer.empty();
        }

        //let's not worry about top/skip being over the albums' length
        //for each album generate dom
        renderer.manager.albums.slice(renderer.manager.albumSkip, renderer.manager.albumSkip + renderer.manager.albumTops)
            .forEach(album => {
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
        albumPhotos.slice(photoSkip, photoSkip + renderer.manager.photoTops)
            .forEach((albumPhoto: photo) => {
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