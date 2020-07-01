import alien from "../assets/players/alien.png";
import player1 from "../assets/players/player1.png";
import player2 from "../assets/players/player2.png";
import player3 from "../assets/players/player3.png";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'game_over',
        });
    }
    
    init(data){
        this.winner = data;
    }


    preload() {

    }
      
    create() {
        this.infoText = this.add.text(
            this.sys.game.config.width / 2, 
            this.sys.game.config.height / 1.2, 
            `Winner: ${this.winner}\n Click to get back to StartMenu.`, {fontSize: '48px', color: "#ffffff"})
        .setOrigin(0.5,0.5);

        this.infoText.setInteractive(
            new Phaser.Geom.Rectangle(
                0, 0, 
                this.infoText.width,  this.infoText.height), 
                Phaser.Geom.Rectangle.Contains);
        this.infoText.on("pointerdown", function() {
            this.scene.start("main_menu");
            this.scene.stop("game_over");
        },this);
  
    }
}
