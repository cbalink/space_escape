import title_image from "../assets/title_logo.png"
import background_image from "../assets/background.png"
import button_image from "../assets/button.png";
import {connection} from "../network/connection";



export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'main_menu'
        });
    }

    preload(){
       this.load.image("title_logo", title_image);
       this.load.image('background', background_image);
       this.load.image('button', button_image);
       
    }

    create(){
        this.addBackground();
        this.addTitle();
        this.addButtons();
    }

    

    addBackground(){
        this.background = this.add.tileSprite(
            this.sys.game.config.width / 2, 
            this.sys.game.config.height / 2, 
            this.sys.game.config.width, 
            this.sys.game.config.height, 
            'background'
            );
    }

    addTitle(){
        this.titleLogo = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height / 2, "title_logo")
        .setOrigin(0.5,0.5);
    }

    addButtons(){
        this.playButton = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 1.2, "Play", {fontSize: '96px', color: "#ffffff"})
        .setOrigin(0.5,0.5);
        this.playButton.setInteractive(
            new Phaser.Geom.Rectangle(
                0, 0, 
                this.playButton.width,  this.playButton.height), 
                Phaser.Geom.Rectangle.Contains);
        this.playButton.on("pointerdown", function() {
            this.playButton.setScale(1.2,1.2);
            this.scene.start("lobby");
        }, this);
        this.playButton.on("pointerup", function() {
            this.playButton.setScale(1,1);
        }, this);
        this.playButton.on("pointerout", function() {
            this.playButton.setScale(1,1);
        }, this);     
    }

    
    scrollbackground(delta){
       this.background.tilePositionY -= 0.1 * delta;
       
        
    }

    update(time, delta){
        this.scrollbackground(delta);
    }
}

