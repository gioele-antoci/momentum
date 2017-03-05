import { album, comment, photo, post, user, manager } from "./interfaces";
import { renderer } from "./renderer";
import dialog from "./dialog";

export class appManager implements manager {

    readonly root = `http://jsonplaceholder.typicode.com/`;

    users: user[] = [];
    posts: post[] = [];
    albums: album[] = [];
    photos: photo[] = [];
    authUser: user;

    pageRoot: JQuery;
    anonRoot: JQuery;
    authRoot: JQuery;

    constructor() {
        $(document).ready(() => {
            this.pageRoot = $(".root");
            this.anonRoot = $(".anon-root");
            this.authRoot = $(".auth-root");

            dialog.setup(this);
            this.requestUsers().done(() => renderer.setup(this));
        });

    }

    requestUsers(): JQueryXHR {
        const promise = $.getJSON(`${this.root}users`);
        promise.done(data => {
            this.users = data;
        });

        return promise;
    };
}


