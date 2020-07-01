import background_image from "../assets/background.png";
import alien from "../assets/players/alien.png";
import player1 from "../assets/players/player1.png";
import player2 from "../assets/players/player2.png";
import player3 from "../assets/players/player3.png";
import meteorite from "../assets/obstacles/meteorite.png";
import { connection } from "../network/connection";
import powerup_speed from "../assets/powerups/speed.png";
import powerup_invulnerability from "../assets/powerups/speed.png";
import rock_smash from "../assets/audio/rock_smash.mp3";
import "../util/mathHelper";
import { getRandomIntInclusive } from "../util/mathHelper";


export default class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'game',
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false
                }
              }
        });

        this.players = {};

        this.config = {
            game: {
                roundTime: 50 * 1000,
            },
            alien: {
                acceleration: 2000,
                maxVelocity: {
                    x: 400,
                    y: 400
                },
                drag: {
                    x: 1000,
                    y: 1000
                },
                displaySize: {
                    width: 96,
                    height: 96
                }
            },
            player: {
                hitpoints: 2,
                acceleration: 1000,
                maxVelocity: {
                    x: 500,
                    y: 500
                },
                drag: {
                    x: 2000,
                    y: 2000
                },
                displaySize: {
                    width: 64,
                    height: 64 
                }
            },
            obstacles: {
                meteorite: {
                    maxVelocity: {
                        x: 300,
                        y: 300
                    },
                    drag: {
                        x: 100,
                        y: 100
                    },
                    displaySize: {
                        width: 48,
                        height: 48
                    },
                    spawnFrequency: 4000
                } 
            },
            powerups: {
                displaySize: {
                    x: 30,
                    y: 30
                },
                spawnFrequency: 10000,
                speed: {
                    maxVelocityMulti: 1.5,
                    maxAccelerationMulti: 1.5  
                }
            }
        }
    }

    init(data){
        this.joined = data;
    }

    preload() {
        this.load.image("background", background_image);
        //spritesheet so we can support animations in the future
        this.load.spritesheet("alien", alien, {frameWidth: 96, frameHeight: 96}); 
        this.load.spritesheet("player1", player1, {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("player2", player2, {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("player3", player3, {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet("meteorite", meteorite, {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet("powerup_speed", powerup_speed, {frameWidth: 19, frameHeight: 30});
        this.load.spritesheet("powerup_invulnerability", powerup_invulnerability, {frameWidth: 31, frameHeight: 30});
        this.load.audio("rock_smash", rock_smash);

    }
    create() {
        this.addBackground();
        this.createObjects();
        this.addPhysics();
        this.createControls();
        this.startRound();
        this.spawnPowerUp();
    }

    createObjects(){
        this.createAlien();
        this.createPlayers();
        this.createObstacles();
        this.createPowerUps();
    }

    createSound(){
        this.rockSmashSound = this.sound.add("rock_smash");
    }

    createAlien(){
        this.alien = this.add
        .sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 5, 'alien')
        .setOrigin(0.5,0.5)
        .setDisplaySize(96,96);
    }

    createPlayers(){
        this.playerGroup = this.physics.add.group({collideWorldBounds: true});
        var i = 0;
        for (let playerId of this.joined){
            let gameObject = this.createPlayerObject(i);
            this.players[playerId] = gameObject;
            gameObject.playerId = playerId;
            gameObject.hitPoints = this.config.player.hitpoints;
            i++;
         } 
    }

    createPlayerObject(index){
        const startX = [
            this.sys.game.config.width/2,
            this.sys.game.config.width/4,
            this.sys.game.config.width/2 + this.sys.game.config.width/4
        ];
        const startY = this.sys.game.config.height / 1.1;
        let key = `player${index+1}`;

        return this.add
        .sprite(startX[index], startY, key)
        .setOrigin(0.5,0.5)
        .setDisplaySize(
            this.config.player.displaySize.width, 
            this.config.player.displaySize.height
        );
    }

    createObstacles(){
        this.obstacles =  this.physics.add.group({
            collideWorldBounds: true, 
            bounceX: true, 
            bounceY: true
        });
        
    }
    createPowerUps(){
        this.powerUps = this.physics.add.group({
            collideWorldBounds: false,
            bounceY: false,
            bounceX: false,
            setImmovable: true,
        });
    }
    spawnObstacle(){
        let spawnPoints =  [
            {
                // TOP SIDE
                x: getRandomIntInclusive(
                    this.config.obstacles.meteorite.displaySize.width * 2,
                    this.sys.game.config.width - this.config.obstacles.meteorite.displaySize.width * 2
                    ),   
                y: this.config.obstacles.meteorite.displaySize.height * 2
            },
            {   // RIGHT SIDE
                x: this.sys.game.config.width - this.config.obstacles.meteorite.displaySize.width * 2,
                y: getRandomIntInclusive(
                    this.config.obstacles.meteorite.displaySize.height *2 , 
                    this.sys.game.config.height - this.config.obstacles.meteorite.displaySize.height * 2)
            },
            {
                // LEFT SIDE
                x: this.config.obstacles.meteorite.displaySize.width * 2,
                y: getRandomIntInclusive(
                    this.config.obstacles.meteorite.displaySize.height *2 , 
                    this.sys.game.config.height - this.config.obstacles.meteorite.displaySize.height * 2)
            }
        ];
        const index = getRandomIntInclusive(0,spawnPoints.length - 1);
        let spawn = spawnPoints[index];
        this.createMeteorite(spawn.x , spawn.y, "meteorite"); 
   
    }

    spawnPowerUp(){
        let spawnX = getRandomIntInclusive(
            this.config.powerups.displaySize.x * 2,
            this.sys.game.config.width - this.config.powerups.displaySize.x * 2,
        );
        let spawnY = getRandomIntInclusive(
            this.config.powerups.displaySize.y * 2,
            this.sys.game.config.height - this.config.powerups.displaySize.y * 2,
        );
        this.createPowerUp(spawnX, spawnY, "powerup_speed");
    }

    createPowerUp(x,y,key){
        let powerUp = this.powerUps.create(x,y,key);
        powerUp.effect = key;
    }

    createMeteorite(x,y,key){
        let meteorite = this.obstacles.create(x,y,key);
        let displaySize = getRandomIntInclusive(
            this.config.obstacles.meteorite.displaySize.width, 
            this.config.obstacles.meteorite.displaySize.width * 2
        )
        meteorite.setDisplaySize(
            displaySize, displaySize);
        meteorite.body.setVelocity(
            getRandomIntInclusive(-100,100),
            getRandomIntInclusive(-100,100)
        );
    }

    addPhysics(){
        this.physics.add.existing(this.alien).body.setCollideWorldBounds(true);
        this.alien.body.setMaxVelocity(this.config.alien.maxVelocity.x, this.config.alien.maxVelocity.y);
        this.alien.body.setDrag(this.config.alien.drag.x, this.config.alien.drag.y);
        this.addPlayerPhysics();
        this.createCollisions();  
    }

    createCollisions(){

        this.physics.add.collider(this.playerGroup, this.alien, this.onPlayerAlienCollision, null, this);
        this.physics.add.collider(this.obstacles, this.alien, this.onObstacleAlienCollision, null, this);
        this.physics.add.collider(this.obstacles, this.playerGroup, this.onObstaclePlayerCollision, null, this);
        this.physics.add.collider(this.obstacles, this.obstacles, this.onObstacleObstacleCollision, null, this);
        this.physics.add.overlap(this.playerGroup, this.powerUps, this.onPlayerPowerupOverlap, null, this);
    }

    addPlayerPhysics(){
        for (let [playerId, gameObject] of Object.entries(this.players)){
            this.playerGroup.add(gameObject);
            gameObject.body.setMaxVelocity(
                this.config.player.maxVelocity.x, 
                this.config.player.maxVelocity.y);  
             gameObject.body.setDrag(this.config.player.drag.x, this.config.player.drag.y);
        }
    }

    onPlayerPowerupOverlap(player, powerup){
        powerup.destroy();
        console.log("player over powerup");
        this.applySpeedBuff(player, 5000);
    }

    applySpeedBuff(gameObject, duration){
        var beforeX = gameObject.body.maxVelocity.x;
        var beforeY = gameObject.body.maxVelocity.y;
        gameObject.body.setMaxVelocity(
            beforeX * this.config.powerups.speed.maxVelocityMulti,
            beforeY * this.config.powerups.speed.maxVelocityMulti
        );

        this.time.addEvent({
            delay: duration,
            callback: () =>  {
                gameObject.body.setMaxVelocity(beforeX, beforeY);
            },
            callbackScope: this,
            loop: false
        }, this);
    }

    onObstacleObstacleCollision(first, second){
        if (first.displayWidth > second.displayWidth){
            second.destroy();
        }
        else{
            first.destroy();
        }
    }
    onObstaclePlayerCollision(obstacle, player){ 
        this.activateMovementPenalty(player, 1000);
    }

    onObstacleAlienCollision(alien, obstacle){
        console.log("alienObstacleCollision");
    }

    startObstacleSpawn(){
        return this.time.addEvent({
            delay: this.config.obstacles.meteorite.spawnFrequency,
            callback: () =>  {
                this.spawnObstacle();
            },
            callbackScope: this,
            loop: true
        }, this);
    }

    onPlayerAlienCollision(alien, player){

        console.log("OnPlayerAlienHitCollision");
        player.hitPoints--;
        player.body.setVelocity(alien.body.velocity.x, alien.body.velocity.y);
        if(player.hitPoints <= 0){
            player.destroy();
            this.sendPlayerDead(player.playerId);
        }
        this.activateMovementPenalty(alien, 2000);  

        this.checkAllPlayersDead();
    }

    checkAllPlayersDead(){
        if (this.playerGroup.countActive <= 0){
            this.gameOver("Alien");
        }
    }

    

    sendPlayerDead(playerId){
        connection.emit("player_dead", playerId);
    }

    startRound(){
        connection.on("movement_update", (playerId, movement) =>{
            this.movePlayer(playerId, movement);
        }, this);
        this.startRoundTimer();
        this.startObstacleSpawn();
    }

    startRoundTimer(){
        this.roundTimer = this.time.addEvent({
            delay: this.config.game.roundTime,
            callback: () =>  {
                this.gameOver("Astronauts");
            },
            callbackScope: this,
            loop: false
        }, this);
    }

    gameOver(winner){
        connection.emit("game_over", winner);
        this.time.removeAllEvents();
        this.scene.start("game_over", winner);
    }

    activateMovementPenalty(gameObject, duration){
        gameObject.body.setMaxVelocity(0,0);
        this.time.addEvent({
            delay: duration,
            callback: () =>  {
                gameObject.body.setMaxVelocity(
                    this.config.alien.maxVelocity.x, 
                    this.config.alien.maxVelocity.y);
            },
            callbackScope: this,
            loop: false
        }, this);
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

    counter = 1;
    movePlayer(playerId, movement){
        var gameObject = this.players[playerId];

        if (!gameObject){
            return;
        }
        var up = movement["up"], down = movement["down"], left = movement["left"], right = movement["right"];
        var anyKey = up || down || left || right;

        if(movement["up"])
        {
            console.log("up");
            gameObject.body.setAccelerationY(-1 * this.config.player.acceleration);
            console.log(gameObject.body.acceleration.y);
        }
        else if(movement["down"])
        {
            gameObject.body.setAccelerationY(this.config.player.acceleration);
        } 

        if(movement["left"])
        {
            gameObject.body.setAccelerationX(-1 * this.config.player.acceleration);
        }
        else if(movement["right"])
        {
            gameObject.body.setAccelerationX(this.config.player.acceleration);
        }

        
    }

    scrollbackground(delta){
        this.background.tilePositionY -= 0.1 * delta;  
     }
 
     update(time, delta){
        this.scrollbackground(delta);
     }

     createControls(){
        //this.alien.body.setFriction(1000,1000);

        this.input.keyboard.on('keydown_W', () => {
            this.alien.body.setAccelerationY(-1* this.config.alien.acceleration);
        });
    
        this.input.keyboard.on('keyup_W', () => {
            this.alien.body.setAccelerationY(0);
        });
        
        this.input.keyboard.on('keydown_S', () => {
            this.alien.body.setAccelerationY(this.config.alien.acceleration); 
        });
    
        this.input.keyboard.on('keyup_S', () => {
            this.alien.body.setAccelerationY(0);
        }); 

        this.input.keyboard.on('keydown_A', () => {
            this.alien.body.setAccelerationX(-1 * this.config.alien.acceleration);
        });
    
        this.input.keyboard.on('keyup_A', () => {
           this.alien.body.setAccelerationX(0);
        }); 

        this.input.keyboard.on('keydown_D', () => {
            this.alien.body.setAccelerationX(this.config.alien.acceleration);
        });
    
        this.input.keyboard.on('keyup_D', () => {
           this.alien.body.setAccelerationX(0);
            
        }); 


        this.input.keyboard.on('keyup_up', () => {
            
        });
    }
}
