import { album, comment, photo, post, user, manager } from "./interfaces";
import { renderer } from "./renderer";
import dialog from "./dialog";
import pageSwitcher from "./pageSwitcher";

export class appManager implements manager {

    readonly root = `${document.location.protocol}//jsonplaceholder.typicode.com/`;

    users: user[] = [];
    posts: post[] = [];
    albums: album[] = [];
    photos: photo[] = [];
    authUser: user;

    pageRoot: JQuery;
    anonRoot: JQuery;
    authRoot: JQuery;
    form: JQuery;
    input: JQuery;
    logoutButton: JQuery;
    userSwitcher: JQuery;
    albumSwitcher: JQuery;

    constructor() {
        $(document).ready(() => {
            this.setup();
            dialog.setup(this);
            pageSwitcher.setup(this);
            this.requestUsers().done(() => {
                renderer.setup();
                renderer.renderUserSwitcher(this.users);
                this.autologin();
            });
        });
    }

    private setup(): void {
        this.pageRoot = $(".root");
        this.anonRoot = $(".anon-root");
        this.authRoot = $(".auth-root");
        this.form = $(".login-form");
        this.input = $(".login-input");
        this.logoutButton = $(".logout");

        this.logoutButton.click(e => {
            this.logout();
        });

        this.form.on("submit", e => {
            e.preventDefault();
            this.login(this.input.val());
        });

        this.userSwitcher = $(".user-switcher");
        this.userSwitcher.on("change", e => {
            const id = (<HTMLOptionElement>e.target).value;
            this.changeUser(this.users.filter(x => x.id === parseInt(id))[0]);
        });

        this.albumSwitcher = $(".album-switcher");
        this.albumSwitcher.on("change", e => {
            const id = (<HTMLOptionElement>e.target).value;
            this.changeAlbum(this.albums.filter(x => x.id === parseInt(id))[0]);
        });

        const resizeListener = () => {
            $(window).one("resize", () => {
                const width = $(window).width();
                this.pageRoot.toggleClass("small", width < 768);
                setTimeout(() => resizeListener(), 100); //rebinds itself after 100ms
            });
        }

        resizeListener();
    }

    private requestUsers(): JQueryXHR {
        const promise = $.getJSON(`${this.root}users`);
        promise.done(data => {
            this.users = data;
        });

        return promise;
    }

    private autologin(): void {
        const localUser = localStorage.getItem("user") && JSON.parse(localStorage.getItem("user"));
        if (localUser) {
            this.login(localUser.username);
        }
    }

    login(username: string): void {
        if (username) {
            const user = this.users.filter(x => x.username === username)[0];
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                this.anonRoot.addClass("hidden");
                this.authRoot.removeClass("hidden");

                this.authUser = user;
                this.changeUser(user);
            }
        }
    }

    logout(): void {
        localStorage.removeItem("user");

        this.anonRoot.removeClass("hidden");
        this.authRoot.addClass("hidden");
    }

    changeUser(user: user): void {
        if (user) {
            //reset
            this.userSwitcher.val(user.id);
            this.pageRoot.addClass("disable");

            //get albums
            const promiseAlbums = $.getJSON(`${this.root}albums?userId=${user.id}`);
            let promisePhotos;

            promiseAlbums.done((data: album[]) => {
                this.albums = data;
                renderer.renderAlbumSwitcher(this.albums);

                //also get all the photos, this could be done in parallel to improve performance 
                //but shouldnt be done at 2am because bad things could happen
                // having promises.all would be sweet but es3 is shit
                promisePhotos = $.getJSON(`${this.root}photos?userId=${user.id}`)
                promisePhotos.done((photoData: photo[]) => {
                    this.photos = photoData;
                    renderer.renderAlbum(this.albums[0], this.getPhotosForAlbum(this.albums[0].id));
                });
            });

            //posts
            const promisePosts = $.getJSON(`${this.root}posts?userId=${user.id}`);
            promisePosts.done((data: post[]) => {
                this.posts = data;
                renderer.renderPosts(this.posts);
            });

            $.when(promisePosts, promiseAlbums, promisePosts).done(() => this.pageRoot.removeClass("disable"));
        }


    }

    changeAlbum(album: album): void {
        renderer.renderAlbum(album, this.getPhotosForAlbum(album.id));
    }

    private getPhotosForAlbum(albumId: number): photo[] {
        return this.photos.filter(x => x.albumId === albumId);
    }

}
