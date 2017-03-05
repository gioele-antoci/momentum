import { album, comment, photo, post, user } from "./interfaces";
import dialog from "./dialog";

let postsEl: JQuery;
let albumsContainer: JQuery;

let postContainer: JQuery;
let postTitle: JQuery;
let postBody: JQuery;
let postCommentsButton: JQuery;

let albumContainer: JQuery;
let albumTitle: JQuery;

let userSwitcher: JQuery;
let albumSwitcher: JQuery;


export class renderer {

    static setup(): void {
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
    }

    static renderUserSwitcher(users: user[]): void {
        users.forEach(user => userSwitcher.append($("<option></option>").attr("value", user.id).text(user.name)));
    }

    static renderAlbumSwitcher(albums: album[]): void {
        albumSwitcher.empty();
        albums.forEach(album => albumSwitcher.append($("<option></option>").attr("value", album.id).text(album.title)));
    }

    static renderAlbum(album: album, albumPhotos: photo[]) {
        albumsContainer.empty();

        //set album title
        const albumEl = albumContainer.clone();
        albumEl.append(albumTitle.clone().text(album.title));

        const photoCont = $(".photo-container", albumEl);

        //set unique id for carousel and its controls
        const id = `album${album.id}`;
        photoCont.attr("id", id);
        $(".carousel-control", photoCont).attr("href", `#${id}`);

        //add to dom
        albumEl.append(photoCont);

        //render photos inside carousel
        renderer.renderPhotos(albumPhotos, photoCont, album.id);

        //in the end append all
        albumsContainer.append(albumEl);
    }

    static renderPhotos(photos: photo[], photoContainer: JQuery, albumId: number) {
        //get photos for this album only
        const albumPhotos = photos.filter(x => x.albumId === albumId);
        const carouselInner = $(".carousel-inner", photoContainer);
        const photoElTemplate = $(".photo.item", carouselInner).detach();

        albumPhotos.forEach((photo: photo) => {
            const photoEl = photoElTemplate.clone();
            //add image
            const photoImage = $(".photo-image", photoEl);
            photoImage.attr("src", photo.url.replace("http://", `${document.location.protocol}//`)).attr("title", photo.title);
            //add caption
            const photoCaption = $(".carousel-caption", photoEl);
            photoCaption.text(photo.title);

            carouselInner.append(photoEl);
        });

        //mark first image as active
        $(".item", carouselInner).first().addClass("active");
    }

    static renderPosts(posts: post[]) {
        postsEl.empty();
        posts.forEach(post => {
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
    }
}


//# sourceMappingURL=momentum.js.map