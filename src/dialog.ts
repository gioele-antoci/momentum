
import { comment, post, user, manager } from "./interfaces";

export default class dialog {
    static dialogEl: JQuery;
    static textarea: JQuery;
    static postButton: JQuery;
    static commentContainer: JQuery;
    static commentBody: JQuery;
    static commentAuthor: JQuery;
    static commentEl: JQuery;

    private static postId: number;
    private static comments: comment[] = [];

    private static manager: manager;

    static setup = (manager: manager) => {
        dialog.manager = manager;
        dialog.dialogEl = $(".dialog");
        dialog.textarea = $(".comment-textarea");
        dialog.postButton = $(".post-comment");
        dialog.commentContainer = $(".comment-container");

        dialog.commentBody = $(".comment-body").detach();
        dialog.commentAuthor = $(".comment-author").detach();
        dialog.commentEl = $(".comment").detach();

        dialog.postButton.click(e => {
            const val = dialog.textarea.val();
            dialog.textarea.toggleClass("validation-error", !val);
            if (!val) {
                dialog.textarea.attr("placeholder", "Please enter a comment");
                return;
            }

            dialog.textarea.attr("placeholder", "Add a comment");

            const comm: comment = {
                postId: dialog.postId,
                body: val,
                email: dialog.manager.authUser.email,
                name: "This is a comment name"
            };

            $.ajax({
                url: `${dialog.manager.root}posts`,
                method: "POST",
                data: JSON.stringify(comm)
            });
            dialog._renderComment(comm);
            dialog.textarea.val("");
            dialog.textarea.focusin().select();
        });
    };

    static openDialog = () => {
        (<any>dialog.dialogEl).modal("show");
        dialog.textarea.focusin().select();
    };

    static closeDialog = () => {
        (<any>dialog.dialogEl).modal("hide");
    };

    static renderComments = (postId: number) => {
        //comments
        dialog.manager.authRoot.addClass("disable");
        const promiseComments = $.getJSON(`${dialog.manager.root}comments?postId=${postId}`);
        promiseComments.done((data: comment[]) => {
            dialog.comments = data;
            dialog._renderComments(postId);
            dialog.manager.authRoot.removeClass("disable");
        });
    };

    private static _renderComments = (postId: number) => {
        dialog.postId = postId;

        dialog.commentContainer.empty();
        dialog.comments.forEach(x => dialog._renderComment(x));
    };

    private static _renderComment = (comment: comment) => {
        const commentEl = dialog.commentEl.clone();
        commentEl.append(dialog.commentAuthor.clone().text(comment.email));
        commentEl.append(dialog.commentBody.clone().text(comment.body));
        dialog.commentContainer.append(commentEl);
    };
}