const Lobby = require("./util/lobby");
const io = require("socket.io");
const server = io.listen(1337);
const MAX_PLAYERS = 3;

var lobby;
console.log("Hello from Server");

let spawnPoints =  [
    {
        x: getRandomIntInclusive(1,10), 
        y: anotherFunc()
    }];

function someFunc(){
    return 1337;
}
function anotherFunc(){
    return Math.random() * 10;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
  }

console.log(spawnPoints[0]);
console.log(spawnPoints[0].x);
let asd = spawnPoints[0];
console.log(asd.x);
server.on("connection", (socket) => {
    console.log("user connected " + socket.id);

    socket.on("disconnect", (reason) => {
        if (lobby && socket.id == lobby.host) {
            console.log("host disconnected, closing lobby");
            lobby = undefined;
            sendUpdateLobbyStatus();
        }
        console.log("user disconnected " + reason);
    });

    socket.on("host", (name) => {
        console.log("host request received, creating new Lobby");
        createLobby(socket);
        socket.join(lobby.room);
        console.log(lobby);
    });
    socket.on("join", () => {
        joinLobby(socket);
    });
    socket.on("request_update_lobby_status", () => {
        sendUpdateLobbyStatus();
    });

});

function createLobby(socket){
    let hostId = socket.id;

    if (!lobby){
        lobby = new Lobby(hostId, MAX_PLAYERS, "lobby");
        console.log("creating lobby if not exist");
        server.to(hostId).emit("lobby_create_success");

        socket.on("disconnect", () => {
            console.log("host disconnected");
            onHostDisconnect();
            sendUpdateLobbyStatus();
        });
        socket.on("player_dead", (playerId) => {
            console.log("PLAYER DEAD RECEIVED");
            server.to(playerId).emit("player_dead");
        });

        socket.on("game_over", (winner) =>{
            for(let player of lobby.players.values()){
                server.to(player).emit("game_over", winner);
            }
            lobby = undefined;
        });
        sendUpdateLobbyStatus(lobby);
    }else{
        server.to(hostId).emit("lobby_error", "lobby_exists");
    }
}

function joinLobby(socket){
    let playerId = socket.id;
    if(lobby){
        try{
            lobby.addPlayer(playerId);
            sendUpdateLobbyStatus(lobby);
            server.to(playerId).emit("lobby_join_success");
            socket.on("disconnect", () => {
                if(lobby){
                    console.log("client disconnected");
                    lobby.remove(socket.id);
                    sendUpdateLobbyStatus();
                }
                
            });
            socket.on("movement_update", (movement) => {
                if(lobby){
                    server.to(lobby.host).emit("movement_update", socket.id, movement);
                }
            });
            
            if (lobby.isFull()){
                sendStartControl(lobby.players);
                sendStartGame(lobby.host);
                
            }
        }catch(e){
            console.log("ERROR:" +  e.name);
            sendError(playerId, "lobby_error", e.message);
            //server.to(playerId).emit("lobby_error", e.message);
        }
    }else{
        console.log("lobby doesnt exist");
        server.to(playerId).emit("lobby_error", "not_found");
    }
}

function sendStartGame(hostId){
    //console.log("sendstartgame" + lobby.players);
    server.to(hostId).emit("start_game", Array.from(lobby.players));
    console.log("SENDSTARTGAME " + lobby.players);
}

function sendStartControl(players){
    for (player of players){
        server.to(player).emit("start_control");
    }  
}

function sendUpdateLobbyStatus(){
    server.sockets.emit("update_lobby_status", lobby);
}

function sendError(client, type, message){
    server.to(client).emit(type, message);
}

function GameOver(){

}


function onHostDisconnect(){
    server.sockets.emit("host_disconnect");
}
