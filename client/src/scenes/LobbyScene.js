import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import {connection} from "../network/connection";

const COLOR_LIGHT = 0xffffff;

export default class LobbyScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'lobby'
        })
        this.activeLobby;
        this.playerId;
    }

    preload() { 
        this.load.scenePlugin('rexuiplugin', UIPlugin, "rexUI", "rexUI");   
    }
  
    create() {
        this.createButtons();
        this.setupConnectionEvents();
        this.requestUpdate();
    }   

    setupConnectionEvents(){
        this.onPlayerJoined();
        this.onLobbyCreated();
        this.onLobbyError();
        this.onUpdate();
        this.onGameReady();  
    }

    // outgoing events
    sendJoinRequest(){
        connection.emit("join");
    }

    sendHostRequest(lobbyName){
        connection.emit("host");
    }

    requestUpdate(){
        console.log("requesting update");
        connection.emit("request_update_lobby_status");
    }

    // receiving events
    onPlayerJoined(){
        connection.on("lobby_join_success", (playerId) =>{
            this.updateJoinUI();
        });
    }

    onLobbyCreated(){
        connection.on("lobby_create_success", () => {
            this.updateHostUI();
        });
    }

    onLobbyError(){
        connection.on("lobby_error", (message) => {
            this.errorText.setText(message);
        });
    }

    onUpdate(){
        connection.on("update_lobby_status", (lobby) => {
            this.activeLobby = lobby;
            this.updateInfoUI();
        });
    }

    onGameReady(){
        connection.on("start_game", (players) => {
            this.scene.start("game", players);
        });

        connection.on("start_control", (players) => {
            this.scene.start("control");
        });
    }

    isHost(){
        return connection.id == this.activeLobby.host;
    }

    // UI update stuff
    updateHostUI(){
        this.errorText.setText("");
        this.hostButton.text = "Start";
        this.joinButton.setVisible(false);
        this.hostButton.setVisible(false);
        this.instructionsText.setText("Hosting a Game, waiting for Players");   
    }

    updateJoinUI(){
        this.errorText.setText("");
        this.joinButton.setVisible(false);
        this.hostButton.setVisible(false);
        this.instructionsText.setText("Joined a Game, waiting for Start"); 
    }

    updateInfoUI(){
        console.log("UPDATING UI ELEMENTS");
        if (this.activeLobby){
            console.log("has active lobby");
            console.log(this.activeLobby);
            let numPlayers = this.activeLobby.numPlayers;
            let maxNumPlayers = this.activeLobby.maxNumPlayers;
            this.lobbyInfoText.setText(`${this.activeLobby.numPlayers}/${this.activeLobby.maxNumPlayers}`);
            
        }
        else{
            this.lobbyInfoText.setText("no lobby yet");
        }
    }
    // UI Stuff
    createButtons(){
        this.joinButton =  this.createButton("Join", "join");
        this.hostButton =  this.createButton("Host", "host")

        this.instructionsText = this.add.text(
            this.sys.game.config.width / 2, this.sys.game.config.height / 4, 
            "Host or Join a Game", 
            {fontSize: "48px", color: "#ffffff"}
        )
        .setOrigin(0.5,0.5);
        this.lobbyInfoText = this.add.text(
            this.sys.game.config.width / 2, this.sys.game.config.height / 3, 
            "", 
            {fontSize: "48px", color: "#ffffff"}
        )
        .setOrigin(0.5,0.5);
        this.errorText = this.add.text(
            this.sys.game.config.width / 2, this.sys.game.config.height / 1.5, 
            "", 
            {fontSize: "48px", color: "#ff0000"}
        )
        .setOrigin(0.5,0.5);
        var align = "center";
        this.buttons = this.rexUI.add.buttons({
            x: this.sys.game.config.width / 2, y: this.sys.game.config.height / 2,
            width: 300,
            orientation: "x",

            buttons: [
                this.joinButton,
                this.hostButton
            ],

            align: align
        })
        .layout();
     
        this.buttons
            .on("button.click", function (button, index, pointer, event) {
                console.log("clicked " + button.name);
                switch(button.name){
                    case "join":
                        connection.emit("join");
                        break;
                    case "host":
                        connection.emit("host");
                        break;
                }
            }, this)
    }

    createButton(text, name){
        return this.rexUI.add.label({
            width: 400,
            height: 80,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_LIGHT),
            text: this.add.text(0, 0, text, {
                fontSize: 18,
                color: "#000000"
            }),
            space: {
                left: 10,
                right: 10,
            },
            align: 'center',
            name: name
        });
    }

}
