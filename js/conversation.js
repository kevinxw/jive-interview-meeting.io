/**
 * Created by Kevin on 2/15/14.
 */

// define conversation class
var Conversation = (function () {
    // bind a conversation to html object (chat box)
    // though making Conversation a pure data structure could be a better design
    // here I am linking the Conversation with HTML object directly
    // in order to make things simple
    var $$instance = function ($chatBoxId) {
        var chatBoxObj = $($chatBoxId),
            conversationHistory = [],
            me = null, partner = null;

        // put a new message into conversation timeline
        function putMessage($msg) {
            $msg = $msg || {};
            var msg = $msg instanceof Message ? $msg : new Message($msg);
            if (!msg.isValid())
                return;
            // put it into chat history, though it is useless in this mini project
            // it can be useful if we want to extends the system in the future
            conversationHistory.push(msg);
            var htmlMsgObj = msg.newHtmlObj();
            var timeline = $(".timeline", chatBoxObj).append(htmlMsgObj);
            $(".timeline-container", chatBoxObj)
                .scrollTop(Math.round(htmlMsgObj.offset().top - timeline.offset().top));
        }

        $.extend(this, {
            "putMsg": putMessage,
            // getters and setters
            "partner": function ($p) {
                ($p !== undefined) ? (partner = Peer.getPeer($p)) : partner;
                $(".header .name", chatBoxObj).text(
                    (partner && partner.isValid()) ? "Chat with "+partner.name() : "Disconnected"
                );
                return partner;
            },
            "me": function ($p) {
                return ($p !== undefined) ? (me = Peer.getPeer($p)) : me;
            }
        })
    };

    return $.extend($$instance, {
    });
})();