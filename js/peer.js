/**
 * Created by Kevin on 2/15/14.
 */

// A Person class
var Peer = (function () {
    var peerList = {};  // global peer list

    var $$instance = (function ($dat) {
        var id = null;

        $dat = $dat || {};
        if (!isNaN($dat["id"]))
            id = $dat["id"];
        var name = $dat["name"] || "Anonymous";

        $.extend(this, {
            // test whether two peers are the same
            "equals": function ($dat) {
                return ($dat instanceof Peer) ? $dat.id() == id : $dat == id;
            },

            "name": function () {
                return name;
            },

            "id": function () {
                return id;
            },

            "isValid": function () {
                return !!id;
            },
            "serialize": function () {
                if (!id)
                    return null;
                return {
                    "id": id,
                    "name": name
                };
            }
        });

        if (!this.isValid())
            return;
        // push to global list only when the value is not yet set
        (!peerList[id]) && (peerList[id] = this);
    });

    return $.extend($$instance, {
        // get peer merely by id
        "getPeerById": function ($id) {
            return $id ? peerList[$id] : null;
        },

        // get a peer or create one when not exist
        "getPeer": function ($dat) {
            if (!$dat)
                return null;
            return $dat instanceof Peer ? $dat : ($$instance.getPeerById($dat["id"]) || new Peer($dat));
        }
    })
})();
