var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(80);

// simplest request handler
function handler(req, res) {
    var url = req.url == "/" ? req.url + "index.html" : req.url;
    fs.readFile(__dirname + url,
        function (err, data) {
            if (err) {
                res.writeHead(404);
                return res.end('Error loading ' + url);
            }
            if (/\.js$/i.test(req.url))
                res.setHeader('content-type', 'text/javascript');
            /* interesting.. IE doesn't load the css file if we don't specify the content type #STUPIDIE */
            else if (/\.css$/i.test(req.url))
                res.setHeader('content-type', 'text/css');
            else
                res.setHeader('content-type', 'text/html');
            res.writeHead(200);
            res.end(data);
        }
    );
}

// NOTICE this simple service do not provide full chatting service
// means it's only a simulation. We cannot ensure two user will
// connect to the same channel after they disconnected and reconnected
// User's identity is purely based on socket object, which will be changed
// per connection. Real-world project uses much stronger authentication,
// so I do not worry about this :)
var uid = 1,// id starts from 1, avoids a lot of trouble
    onlinePeerList = [], // a list of user id who is online
    socketList = {},// dictionary of sockets, indexed by user id
    loneHearts = [];   // online user who is still alone

// assume this function reads the database and returns corresponding peer instance
function getPeerById($id) {
    return $id ?
        (isNaN($id) ? $id : {
            "id": $id,
            "name": "User_" + $id
        })
        : null;
}

// if this peer is still online
function isPeerOnline($pid) {
    return $pid && (onlinePeerList.indexOf($pid) > -1);
}

// set peer as offline
function offlinePeer($p) {
    if (!isPeerOnline($p))
        return;
    onlinePeerList.splice(onlinePeerList.indexOf($p), 1);
    delete socketList[$p];
}

// set peer as online
function onlinePeer($p, socket) {
    if (isPeerOnline($p))
        return;
    onlinePeerList.push($p);   // add current user to online user list
    socketList[$p] = socket; // put socket into dictionary
}

io.sockets.on('connection', function (socket) {
    var curPeerId = uid++,
        me = getPeerById(curPeerId),
        partner = null;// set default partner

    // when connected or reconnected
    function online() {
        onlinePeer(curPeerId, socket);
        // here comes a dumb simulation of friend match service
        // whenever there is someone online alone, we connect he with this new user
        var pId = loneHearts.shift();    // find out who is lonely
        if (!pId || pId == curPeerId) {
            loneHearts.push(curPeerId); // Well, me myself is lonely
        }
        else if (isPeerOnline(pId)) { // if the lonesome one is still online
            partner = getPeerById(pId);
            // say hi to partner client, let him know who I am
            socketList[pId].emit("hi", { "partner": me });
            socketList[pId].emit("msg", {  "isSys": true, "content": "Your are now connected with " + me.name + ""});
        }
        socket.emit("msg", { "isSys": true, "content": "Hello " + me.name + "! Welcome"});
        partner && socket.emit("msg", { "isSys": true, "content": "Your are now connected with " + partner.name + ""});
        // self identification
        socket.emit("hi", { "partner": partner, "me": me });
        /*console.log("Connected. Current online peer:", onlinePeerList.length,
         ", current peerId:", curPeerId,
         ", partner:", partner);*/
    }

    // on disconnect, unregister the chat window
    // A KNOWN BUG: sometimes this won't be triggered, don't know why
    socket.on("disconnect", function () {
        offlinePeer(curPeerId);
        //console.log("Disconnect. Current online peer:", onlinePeerList.length, ", uid:", curPeerId);
        // his partner will be alone again
        if (partner && isPeerOnline(partner.id)) {
            loneHearts.push(partner.id);
            socketList[partner.id].emit("hi", { "partner": null });
            socketList[partner.id].emit("msg", { "isSys": true, "content": "Your companion has left the conversation."});
        }
        else if (loneHearts.indexOf(curPeerId) > -1) // remove myself from the lonesome list
            loneHearts.splice(loneHearts.indexOf(curPeerId), 1);
        partner = null;
    });

    // find a new partner when reconnect
    socket.on("reconnect", online);

    // forward message to partner
    socket.on("msg", function (data) {
        // we still ready the "to" first, so that we can extend the system to
        // capable of sending message to anyone in the future
        var p = data["to"] || partner;
        (p && !partner) && (partner = p);  // set default partner here
        if (!p) {
            socket.emit("msg", { "isSys": true, "content": "Please wait to be connected."});
        }
        else if (isPeerOnline(p.id)) {  // forward
            socketList[p.id].emit("msg", data);
            //console.log("Forward message", data, "to partner", partner);
        }
        else {  // partner is offline due to unknown reason
            loneHearts.indexOf(curPeerId) < 0 && loneHearts.push(curPeerId); // lonely again
            socket.emit("hi", { "partner": partner = null });
            socket.emit("msg", { "isSys": true, "content": "Your companion has left the conversation."});
        }
    });

    online();   // get online
});

