import { album, comment, photo, post, user, manager, view } from "./interfaces";

export default class pageSwitcher {

    private static manager: manager;

    private static pageHeader: JQuery;
    private static navPosts: JQuery;
    private static navAlbums: JQuery;

    private static postsView: JQuery;
    private static albumsView: JQuery;

    private static activeView: view;
    private static activeViewEl: JQuery;

    static setup(manager: manager): void {
        pageSwitcher.manager = manager;
        pageSwitcher.pageHeader = $(".page-header");
        pageSwitcher.navPosts = $(".nav-posts").click(e => this.changeView(view.posts));
        pageSwitcher.navAlbums = $(".nav-albums").click(e => this.changeView(view.albums));

        pageSwitcher.postsView = $(".posts-view");
        pageSwitcher.albumsView = $(".albums-view");

        this.changeView(view.posts);
    }

    private static changeView(viewToActivate: view): void {
        if (typeof this.activeView !== "undefined") {
            this.activeViewEl.addClass("hidden");

            switch (this.activeView) {            
                case view.posts:
                    this.navPosts.removeClass("active");
                    break;
                case view.albums:
                    this.navAlbums.removeClass("active");
                    break;
            }
        }

        this.activeView = viewToActivate;
        switch (this.activeView) {           
            case view.posts:
                this.activeViewEl = this.postsView.removeClass("hidden");
                this.pageHeader.text("Posts");
                this.navPosts.addClass("active");
                break;

            case view.albums:
                this.activeViewEl = this.albumsView.removeClass("hidden");
                this.pageHeader.text("Albums");
                this.navAlbums.addClass("active");
                break;

        }

    }
}