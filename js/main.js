/**
 * Created by Kevin on 2/15/14.
 */

(function () {
    // copy the template chat box and insert it into dom, just that simple
    function addChatWidget() {
        var newChatBox = $(".chat-box-template")    // create a clone here
                .clone()
                .removeClass("chat-box-template"),
            container = $(".chat-box-container");

        // load chat page now
        $("iframe", newChatBox).attr("src", "/chat.html");
        // at last, prepend it to container
        container.append(newChatBox);
        // hide the 6th chat box (don't forget the template), ensure we won't have two rows
        if ($(".chat-box").length > 5)
            $(".chat-box-template + .chat-box").remove();
    }

    // a simple binding which opens new chat widget
    $(document).ready(function () {
        $(".chat-widget-btn").bind('click', addChatWidget);
    });
})()