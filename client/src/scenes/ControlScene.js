import virtualJoyStick from "../util/rexvirtualjoystickplugin.min.js";
import { connection } from "../network/connection";

export default class ControlScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'control',
        });
    }

    lastInput = {"up":false, "down":false, "left": false, "right": false};
    currentInput = {"up":false, "down":false, "left": false, "right": false};
    dead = false;

    preload() {
        this.load.plugin('rexvirtualjoystickplugin', virtualJoyStick, true);
    }
      
    create() {

        this.infoText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 1.2, "Use WASD to move!", {fontSize: '96px', color: "#ffffff"})
        .setOrigin(0.5,0.5);

        
        const x = this.sys.game.config.width / 2;
        const y = this.sys.game.config.height / 2;
        const radius = 200;

        this.createVirtualJoystick(x, y, radius);
        this.createKeyboardControls();
        this.subscribeEvents();
        // use larger send intervals
        this.startInputTimer(200);
    }

    // https://codepen.io/rexrainbow/pen/oyqvQY
    createVirtualJoystick(x,y, radius){
        this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: x,
            y: y,
            radius: radius,
            base: this.add.circle(0, 0, 100, 0x888888),
            thumb: this.add.circle(0, 0, 50, 0xcccccc),
                    // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
                    // forceMin: 16,
                    // enable: true
            })
            .on('update', this.dumpJoyStickState, this);
    
            this.text = this.add.text(0, 0);
            this.dumpJoyStickState();
    }

    // https://codepen.io/rexrainbow/pen/oyqvQY
    dumpJoyStickState() {
        var cursorKeys = this.joyStick.createCursorKeys();
        var s = 'Key down: ';
        var inputUpdate = {"up":false, "down":false, "left": false, "right": false};
        for (var name in cursorKeys) {
            if (cursorKeys[name].isDown) {
                
                s += name + ' ';
            }
            this.currentInput[name] = cursorKeys[name].isDown;

            
            /*if(this.inputChanged(this.lastInput, inputUpdate)){
                this.lastInput = inputUpdate;
                console.log(inputUpdate); 
            }*/
        }
        s += '\n';
        s += ('Force: ' + Math.floor(this.joyStick.force * 100) / 100 + '\n');
        s += ('Angle: ' + Math.floor(this.joyStick.angle * 100) / 100 + '\n');
        this.text.setText(s);
    }

    startInputTimer(delay){
        this.inputTimer = this.time.addEvent({
            delay: delay,
            callback: () =>  {
                this.sendInputIfChanged();
            },
            callbackScope: this,
            loop: true
        }, this);
    }
     
    inputChanged(old, update){
        for (let key in old){
            if (old[key] != update[key]){
                return true;
            }    
        }
        return false;
    }

    sendInputIfChanged(){
         if (this.inputChanged(this.lastInput, this.currentInput)){
            console.log("sendMovementUpdate");
            console.log("current: ");
            console.log(this.currentInput);
            console.log("last: ");
            console.log(this.lastInput);
            
            this.sendMovementUpdate(this.lastInput);
            this.updateLastInput();
        }
    }

    updateLastInput(){
        for (var key in this.currentInput){
            this.lastInput[key] = this.currentInput[key];
        }
    }

    sendMovementUpdate(movementUpdate){
        if (!this.dead){
            connection.emit("movement_update", movementUpdate);
        }  
    }

    subscribeEvents(){
        connection.on("player_dead", () => {
            this.infoText.setText("You are dead!");
            this.dead = true;
            this.time.removeAllEvents();
        }, this);
        connection.on("game_over", (winner) =>{
            this.scene.start("game_over", winner);
            this.scene.stop("control");
        });
    }


    createKeyboardControls(){

        this.input.keyboard.on('keydown_W', () => {
            this.lastInput["up"] = true;
            this.sendMovementUpdate(this.lastInput);
        });
    
        this.input.keyboard.on('keyup_W', () => {
            this.lastInput["up"] = false;
            this.sendMovementUpdate(this.lastInput);
        });
        
        this.input.keyboard.on('keydown_S', () => {
            this.lastInput["down"] = true;
            this.sendMovementUpdate(this.lastInput);
        });
    
        this.input.keyboard.on('keyup_S', () => {
            this.lastInput["down"] = false;
            this.sendMovementUpdate(this.lastInput);
        }); 

        this.input.keyboard.on('keydown_A', () => {
            this.lastInput["left"] = true;
            this.sendMovementUpdate(this.lastInput);
        });
    
        this.input.keyboard.on('keyup_A', () => {
            this.lastInput["left"] = false;
            this.sendMovementUpdate(this.lastInput);
        }); 

        this.input.keyboard.on('keydown_D', () => {
            this.lastInput["right"] = true;
            this.sendMovementUpdate(this.lastInput);
        });
    
        this.input.keyboard.on('keyup_D', () => {
            this.lastInput["right"] = false;
            this.sendMovementUpdate(this.lastInput);
        }); 

    }
}
