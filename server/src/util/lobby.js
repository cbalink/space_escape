const LobbyException = require("./lobbyException");
 
class Lobby {
    constructor(host, maxNumPlayers, room){
        this.room = room;
        this.host = host;
        this.maxNumPlayers = maxNumPlayers;
        this.numPlayers = 0;
        this.players = new Set();
        this.closed = false;
    }

    addPlayer(playerId){
        if (this.closed){
            throw new LobbyException(LobbyException.LOBBY_CLOSED);
        }
        if (playerId == this.host){
            throw new LobbyException(LobbyException.PLAYER_EQUALS_HOST);
        }
        if (this.hasPlayer(playerId)){
            throw new LobbyException(LobbyException.PLAYER_EXISTS);
        }
        if (this.isFull()){
            throw new LobbyException(LobbyException.LOBBY_FULL);
        }
        console.log("before " + this.players.size);
        this.players.add(playerId);
        this.numPlayers = this.players.size;
        if (this.numPlayers == this.maxNumPlayers){
            this.closed = true;
        }
        return true;  
    }


    remove(playerId){
        this.players.delete(playerId);
        this.numPlayers = this.players.size;
    }

    hasPlayer(playerId){
        console.log("hasPlayer?" + playerId + " " + this.players.has(playerId));
        return this.players.has(playerId);
    }

    isFull(){
        return this.players.size == this.maxNumPlayers;
    }

    spotOpen(){
        return !this.isFull();
    }

}

module.exports = Lobby