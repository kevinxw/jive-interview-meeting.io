/**
 * Created by Kevin on 2/15/14.
 */

(function () {

    // conversation object, notice we cannot load it here since the doc may not be ready
    var con = null;

    // initial function, triggered when document is ready
    function init() {
        // load conversation object here
        con = new Conversation(".msgBoxContainer");
        // remove loading sign
        $(".timeline-container").removeClass("loading");
        // bind ENTER key
        $(".sendMsgBox .editable-textbox").keypress(
            function (event) {
                var $this = $(this);
                if (event.which == 13) {
                    event.preventDefault();
                    var content = $this.text();
                    if (!content)
                        return;
                    var msg = new Message(
                        {
                            "from": con.me(),
                            "to": con.partner(),
                            "content": content
                        }
                    );
                    // empty the text box when the partner is online
                    if (con.partner())
                        $this.text("");
                    // display the message in local chatting box
                    con.putMsg(msg);
                    // send it
                    socket.emit("msg", msg.serialize());
                }
            }
        )
        ;
    }

    // when we are online
    function online() {
        //console.log("Connected to the server");
    }

    // build connection
    var socket = io.connect("http://localhost");
    socket.on("connect", online);
    socket.on("reconnect", online);
    socket.on("disconnect", function () {
        if (!con)
            return;
        // reset partner
        con.partner(null);
        //console.log("Disconnected from the server");
    });

    // receive update information
    socket.on("hi", function ($data) {
        if (!con)
            return;
        if ($data["me"]) {
            con.me($data["me"]);
        }
        if (con.partner($data["partner"])) {
            //console.log(con.partner().name(), "joined the conversation");
        }
        else {
            //console.log("Your companion is not connected");
        }
    });

    // on receive message
    socket.on("msg", function ($data) {
        if (!con)
            return;
        var msg = new Message($data);
        if (!msg.isValid())
            return;
        con.putMsg(msg);
    });

    $(document).ready(init);
})();