/**
 * Created by Kevin on 2/15/14.
 */

// one message contains one message
// keep information such as speaker, message content, send time
var Message = (function () {
    var $$instance = function ($dat) {
        $dat = $dat || {};
        var from = Peer.getPeer($dat["from"]),
            to = Peer.getPeer($dat["to"]),
            isSystemMsg = $dat["isSys"] || false,
        // timestamp is not used as well, though you can display it
            time = $dat["timestamp"] ? new Date($dat["timestamp"] * 1000) : new Date(),
            avatar = null,  // not used here
            content = $dat["content"] || "";

        $.extend(this, {
            // some getters here =============
            "from": function () {
                return from;
            },
            "to": function () {
                return to;
            },
            "time": function () {
                return time;
            },
            "avatar": function () {
                return avatar;
            },
            "content": function () {
                return content;
            },
            // end getters =================
            "isValid": function () {
                return (isSystemMsg || from && to && from.isValid() && to.isValid()) && !!content.length;
            },
            // bind message to a newly created html object (set the object's content)
            "newHtmlObj": function () {
                var obj = $(".msgTemplate")
                    .clone()
                    .removeClass("msgTemplate");
                if (isSystemMsg)    // if this is a system message
                    obj.addClass("systemMsg");
                // this line never gonna happen since we do not set avatar at all
                // putting it here just to show we can do that
                avatar && $(".avatar", obj).attr("src", avatar);
                isSystemMsg ?
                    $(".name", obj).text("SYSTEM") :
                    from && from.isValid() && $(".name", obj).text(from.name());
                content && $(".msgContent", obj).text(Message.encodeMsgContent(content));
                return obj;
            },
            // serialization
            "serialize": function () {
                return {
                    "isSys": isSystemMsg,
                    "from": from ? from.serialize() : null,
                    "to": to ? to.serialize() : null,
                    "timestamp": time.getTime(),
                    "avatar": avatar,
                    "content": content
                };
            }
        });
    }

    return $.extend($$instance, {
        // get message content from editable div's html code
        "decodeMsgContent": function ($content) {
            // filter new paragraph markup or new line markup
            // var msg = $content.replace(/<(?:br)|p\s*\/?\s*>/ig, '\n');
            // we SHOULD replace all the markups, to avoid malicious attack
            // but here I am just being lazy and filter nothing
            // that actually ensures we will have the same display in both chat window
            var msg = encodeURI($content);
            return msg;
        },
        // respectively, we have encoding here
        "encodeMsgContent": function ($msg) {
            var content = decodeURIComponent($msg);
            return content;
        }
    });
})();
