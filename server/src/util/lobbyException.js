class LobbyException extends Error{
    constructor(message){
        super(message);
        this.name = "LobbyException";
    }  
    

    static get PLAYER_EQUALS_HOST() {return  "lobby_player_equals_host"};
    static get PLAYER_EXISTS() {return  "lobby_player_exists"};
    static get LOBBY_FULL() {return  "lobby_full"};
    static get LOBBY_CLOSED() {return  "lobby_closed"};

    

    
}
module.exports = LobbyException;