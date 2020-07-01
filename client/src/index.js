import Phaser from "phaser";
import MainMenuScene from './scenes/MainMenuScene'
import GameScene from './scenes/GameScene'
import LobbyScene from "./scenes/LobbyScene";
import ControlScene from "./scenes/ControlScene";
import GameOverScene from "./scenes/GameOverScene";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  
  scene: [MainMenuScene,LobbyScene,GameScene,ControlScene,GameOverScene]
};

const game = new Phaser.Game(config);

function preload() {

}

function create() {
  game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
  game.scale.startFullScreen(true);
}
