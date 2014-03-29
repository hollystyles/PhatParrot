//************************************************************
//	Game:		Phat Parrot
//  Author:		styles.holly@googlemail.com
//  Date:		2014-03-06
//
//	Credits:	Based on 'Flappy Bird' created by Dong Nguyen 
//				(https://twitter.com/dongatory)
//************************************************************

//Globals
//No global variables !! Global variables bad, 'k?
var game;
//Initialisation, this is the main function or the entry point to the programme.
//This is called from the body tags onload event in the index.html web-page.
function initGame(){
	
	//Get a reference to the HTML5 canvas element and it's 2d drawing context.
	var canvas = document.getElementById('canvas1');
	var context = canvas.getContext('2d');
	
	//Pass the context and assets to a new game instance.
	game = new Game(context);
	
	//Start the game.
	game.run();
	
}

//The Game object, responsible for:
//		1. The main loop.
//		2. Capturing keyboard input.
//		3. Coordinating updates and drawing.
function Game(context){
	
	var INITIAL_SPEED = 80
	var game = this;					//Reference to this game instance.
	
	//Public properties
	this.ctx = context;					//The canvas 2d drawing context.
	this.assets = setUpAssets(this);	//The array of game objects.
	this.paused = false;				//Game paused flag.
	this.timer = null;					//Game loop timer.
	this.loopInterval = INITIAL_SPEED;	//Loop interval in milliseconds.
	
	bindKeys(game);						//Set up keydown event listener.
	
	//Starts the game loop
	this.run = function(){
		game.timer = setInterval(game.loop, game.loopInterval);
	}
	
	//The main game loop
	this.loop = function(){
		if(!game.paused){
			//Update game state.
			update(game);
			//Draw everythig.
			draw(game);
		}
	};
	
	this.speedUp = function(){
		if(game.loopInterval > 20){
			setGameSpeed(game.loopInterval - 20) //Decrease loop interval by 20 milliseconds
		}
	}
	
	this.slowDown = function (){
		if(game.loopInterval < 140){
			setGameSpeed(game.loopInterval + 20) //Increase loop interval by 20 milliseconds
		}
	}
	
	this.fps = function(){
		return (Math.floor(1000 / game.loopInterval));
	}
	
	this.resetGame = function(){
		game.paused = false;
		setGameSpeed(INITIAL_SPEED);
	}
	
	//Update game state.
	function update(game){
		//Iterate all game objects.
		for(var i = 0; i < game.assets.length; i++){
			//Request each asset to update it's state.
			game.assets[i].update(game);
		}
	};
	
	//Draw everything to the screen.
	function draw(game){
		//Clear the drawing context of all drawn objects.
		game.ctx.clearRect(0, 0, this.w, this.h);
		//Iterate all game objects.
		for(var i = 0; i < game.assets.length; i++){
			//Request each asset draws itself to the screen.
			game.assets[i].draw(game);
		}
	};
	
	function setGameSpeed(speed){
		game.loopInterval = speed;								//Set new interval in milliseconds between each game loop.
		clearInterval(game.timer);								//Clear the current timer.
		game.timer = setInterval(game.loop, game.loopInterval); //Start new timer at new speed.
	}
	
	//Helper function populates an array of game objects,
	//called by the Game object during its construction.
	function setUpAssets(game){
		
		//Declare an empty array.
		var assets = [];
		
		//Push assets onto the array.
		assets.push(new Levels(game));		//Add a background.
		assets.push(new Sprite(game));			//Add Phat Parrot.
		assets.push(new Gates(game));			//Add the gate obstacles.
		assets.push(new Stats(game));			//Add a stats object.
		assets.push(new InfoScreen(game));
		
		return assets;							//Return the populated array.
	}
	
	//Set up handler for keyboard events.
	function bindKeys(game){
		//Handler function for when player presses any key.
		bindEvent(window, 'keydown', function(e){
			
			//console.log(e.keyCode);
			if(e.keyCode == 80){ 				//80 P was pressed
				game.paused = !game.paused;		//Pause the game;
				
			} else if (e.keyCode == 189){ 		//189 - was pressed
				game.slowDown();
				
			} else if ( e.keyCode == 187){		//187 + was pressed
				game.speedUp();
				
			} else if ( e.keyCode == 82 ){		//82 R was pressed.
				game.resetGame();
			}
			
			//Iterate all assets
			for(var i = 0; i < game.assets.length; i++){
				//Send key press to each game object.
				game.assets[i].receiveKey(e.keyCode, game);
			}
		});
	}
}

//A game asset for the levels in teh game.
function Levels(game){
	
	var GATES_PER_LEVEL = 5;
	
	this.x = 0;							//Background x coordinate.
	this.y = 0;							//Background y coordinate.
	this.w = game.ctx.canvas.width;		//Background width.
	this.h = game.ctx.canvas.height;	//Background height.
	this.levelFrames = [];
	this.bgImageNames = ["jungle.png", "inca.png", "desert.png", "peru.png"];
	this.levelIndex = 0;
	this.level = 1;
	this.leveledUp = false;
	
	for(var i = 0; i < this.bgImageNames.length; i++){
		var img = new Image();
		img.src = this.bgImageNames[i];
		this.levelFrames.push(img);
	}
	
	var levels = this;
	
	//All game asset objects must have an update function.
	this.update = function(game){
	
		var stats = game.assets[3];
		
		if(levels.levelIndex < (levels.levelFrames.length)
			&& stats.score > 0){
			
			if(!levels.leveledUp
				&& stats.score % GATES_PER_LEVEL == 0){	
				
				levels.levelIndex++;
				levels.level++;
				levels.leveledUp = true;
				game.assets[4].toast("Level " + levels.level, 3);
				
			} else if ( stats.score % GATES_PER_LEVEL == 1){
			
				levels.leveledUp = false;
				
			}
		} else {
			levels.levelIndex = 0;
		}
		
		//if(levels.level % levels.levelFrames.length == 0){
		//	game.speedUp();
		//}
	}
	
	//All game asset objects must have a draw function.
	this.draw = function(game){
		//Draw the background image to the screen.
		game.ctx.drawImage(levels.levelFrames[levels.levelIndex], this.x, this.y);
	};
	
	//All game asset objects must have a receiveKey function.
	this.receiveKey = function(keyCode, game){
		if(keyCode == 82){
			levels.levelIndex = 0;
			levels.level = 1;
		}
	}
	
}

//A game asset for the main sprite. Our parrot hero!
function Sprite(game){
	
	this.x = 0;											//Phat Parrot's x coordinate.
	this.y = 0;											//Phat Parrot's y coordinate.
	this.vy = 0;										//Phat Parrot's vertical velocity in pixels.
	this.w = 0;											//Phat Parrot's meaty girth.
	this.h = 0;											//Phat Parrot is a squat litle fellow.
	this.imageNames = ["p1.png", "p2.png", "p3.png"];	//Phat parrots various guises: p1=wing-down, p2=wing-up, p3=dead.
	this.imageFrames = [];								//Array of image objects.
	this.frameIdx = 0;									//Index into imageFrames, determines which of the three guises to draw next.
	this.dead = false;									//That sir is a dead parrot!
	this.immune = false;								//Phat Parrot can fly through solid objects when this is true. Press I key in game.
	this.started = false;
	
	var sprite = this;									//Local reference to this Sprite instance.	
	
	for(var i = 0; i < this.imageNames.length; i++){	//Load all the image frames
		var img = new Image();							//Create a new image object.
		
		if(i == 0){										//When laoding the first image.			
			img.onload = function(){					//Images are loaded asynchronously, so when finished loading.				
				sprite.w = this.width;					//Set Phat Parrot's dimensions to match the image's dimensions.
				sprite.h = this.height;
				
				positionCentre(game.ctx);				//Set Phat Parrots initial position to be the middle of the screen.
				
			};
		}
		
		//Set the image's source filename.
		img.src = this.imageNames[i];
		
		//Push the image into the frame array.
		this.imageFrames.push(img);
	}	
	
	function positionCentre(ctx){
		sprite.x = (ctx.canvas.width / 2) - (sprite.w / 2);	
		sprite.y = (ctx.canvas.height / 2) - (sprite.h / 2);
	}
	
	//All game asset objects must have an update function.
	this.update = function(game){
	
		if(!this.dead){
			//If Parrot's not dead Toggle between wing-up and wing-down images
			//to produce flapping animation.
			this.frameIdx = (this.frameIdx == 0) ? 1 : 0;
		}
		
		if(this.started){
			//Move Phat Parrot vertically, he has a strong relationship with gravity.
			this.y += this.vy;
			//Each loop through the game downward velocity increases.
			this.vy++;
		}
		
		//Has Phat Parrot reached the bottom of the screen?
		if(this.y >= (game.ctx.canvas.height - this.h)){
			
			this.vy = 0;								//Touched bottom so set velocity to zero.			
			this.y = (game.ctx.canvas.height - this.h);	//Set y coordinate to prevent bottom of 
														//sprite going below bottom of screen.
		}		
	};
	
	//All game asset objects must have a draw function.
	this.draw = function(game){
		//Draw Phat Parrot on the screen.
		game.ctx.drawImage(this.imageFrames[this.frameIdx], this.x, this.y);
	};
	
	//All game asset objects must have a receiveKey function.
	this.receiveKey = function(keyCode, game){
	
		//If we are not off the top of the screen, and we are not dead,
		//flying is a distinct possibility.
		if(keyCode == 70 && this.y > 0 && !this.dead){	//keyCode 70 = player is pounding the F key
														//in a frenzied battle against relentless gravity.
			this.started = true;											
			//So set the y velocity to a negative number
			//to make the sprite go up the screen for a bit.
			this.vy = -10;
			
		} else if (keyCode == 73){						//keyCode 73 = I key was pressed.
			
			//Parrot takes on ghostly powers.
			this.immune = !this.immune;
		} else if (keyCode == 82){						//keyCode 82 = R was pressed for reset
			this.frameIdx = 0;
			this.dead = false;
			this.started = false;
			positionCentre(game.ctx);
		}
	}
	
	//You fumbled and flew Phat Parrot into an obstacle.
	//If a gate hits you it calls this function.
	this.hit = function(){
		this.dead = true;			//Kill the parrot.
		this.frameIdx = 2;			//Switch to dead parrot image, no more flapping for you.
		this.vy = 0;				//If parrot was on the rise, he certainly isn't now, 
									//so stop any upward velocity.
	}
}

//A game asset representing the gates that Phat Parrot must fly between.
function Gates(game){
	
	var MIN_GATE_HEIGHT = 50;				//Minimum height for the top gate.
	var GAP_SIZE 		= 150;				//Gap size between gates for parrot to squeeze through.
	var NUM_GATES		= 4;				//Number of gates to cycle across the screen.
	var GATE_INTERVAL 	= 200;				//Distance between each gate.
	var GATE_WIDTH = 36;					//Width of gate image in pixels.
	
	this.gateArray = [];					//Array of gate objects.
	this.gateTop = new Image();				//Top gate image object.
	this.gateBottom  = new Image();			//Bottom gate image object.
	this.gateTop.src = "gateTop.png";		//Top gate image filename.
	this.gateBottom.src = "gateBottom.png";	//Bottom gate image filename.
	this.collision = false;					//Flag to indicate if Phat Parrot collided with a gate.
	this.started = false;
	var gates = this;
	
	//Instantiate some gate objects.
	for(var i = 0; i < NUM_GATES; i++){
		var gate = new Gate();								//Create a new Gate.
		setUpGate(gate, i, game.ctx);
		this.gateArray.push(gate);							//Push the gate onto the array.
	}
	
	//All game asset objects must have an update function.
	this.update = function(game){
		var sprite = game.assets[1];														//Get a reference to Phat Parrot.
		var stats = game.assets[3];														//Get a reference to the stats.
		var levels = game.assets[0];
		
		GAP_SIZE = (150 - (levels.level * 5));
		
		for(var i = 0; i < NUM_GATES; i++){											//Iterate the array of gates.
			var gate = this.gateArray[i];											//Pull current gate from the array.
			if(!this.collision && gate.x < (game.ctx.canvas.width / 2) && !gate.scored){
																					//If we haven't collided with phat parrot 
																					//and have gone passed him on the screen.
				stats.score++;														//Up the stats.
				gate.scored = true;													//Mark this gate as statsd.
			}
			
			if(this.started){
				gate.x -= gate.vx;														//Move the gate to the left.
			}
			
			if(!sprite.immune														//If not in immune mode										
				&& !this.collision													//and not already hit parrot
				&& gate.x < ((game.ctx.canvas.width / 2) + (sprite.w / 2))				//and we're in the strike zone.
				&& gate.x > ((game.ctx.canvas.width / 2) - (sprite.w / 2) - gate.w)){	//i.e. the centre of the screen where parrot is,
																					//do a collision test.
				if(collisionDetected(sprite.x, sprite.y, sprite.w, sprite.h, gate.x, gate.ty, gate.w, gate.th) 
					|| collisionDetected(sprite.x, sprite.y, sprite.w, sprite.h, gate.x, gate.by, gate.w, gate.bh)){
																					//If gate coordinates overlap parrot's coordinates,
					this.collision = true;											//flag the collision;
					sprite.hit();													//tell Parrot the bad news.
				}
				
			}
			
			if(this.collision){														//If we collided.	
				for(var i = 0; i < NUM_GATES; i++){									//Iterate all gates;
					var gate = this.gateArray[i];									//get current get from array;
					gate.x += gate.vx;												//move it back to the right;
					gate.vx = 0;													//Set velocity to 0, no more moving to the left.
				}
			}
			
			if(gate.x <= (0 - gate.w)){												//If the gate has passed the left edge of the screen.
				
				gate.scored = false;												//Reset statsd flag ready for next pass.
				gate.x = game.ctx.canvas.width + (GATE_INTERVAL - GATE_WIDTH);			//Set it's position back to the right hand side of the canvas.
				randomizeLength(gate);												//Give the gate a new random length.
				
			}
		}
	}
	
	//All game asset objects must have a draw function.
	this.draw = function(game){
	
		for(var i = 0; i < NUM_GATES; i++){											//Iterate the array of gate objects.
			var gate = this.gateArray[i];											//Get current gate from array.
			game.ctx.drawImage(this.gateTop, gate.x, gate.th - game.ctx.canvas.height);		//draw top gate part on screen.
			game.ctx.drawImage(this.gateBottom, gate.x, gate.by);						//draw bottom gate part on screen.			
		}
	}
	
	//All game asset objects must have a receiveKey function.
	this.receiveKey = function(keyCode, game){
		if(keyCode == 82){
			this.collision = false;
			this.started = false;
			GAP_SIZE = 150;
			resetGates(game.ctx);
		} else if(keyCode == 70){
			this.started = true;
		}
	}
	
	function resetGates(ctx){
		for(var i = 0; i < NUM_GATES; i++){											//Iterate the array of gate objects.
			var gate = gates.gateArray[i];
			setUpGate(gate, i, ctx);
		}
	}
	
	function setUpGate(gate, i, ctx){
		randomizeLength(gate);								//Set a random length for the gate.
		gate.w = GATE_WIDTH;								//Set the gates width.
		gate.ty = 0;										//Set the top gates y coordinate.
		gate.x = ctx.canvas.width + (i * GATE_INTERVAL);	//Set the gates x coordinate starting from the extreme right hand side of the screen.
		gate.vx = 5;	
		gate.statsd = false;
	}
	
	//Helper function, sets a gate to a random length.
	function randomizeLength(gate){

		gate.th = MIN_GATE_HEIGHT + Math.floor((Math.random() * ((game.ctx.canvas.height - MIN_GATE_HEIGHT) - GAP_SIZE))+1);
		gate.bh = (game.ctx.canvas.height - gate.th) - GAP_SIZE;
		gate.by = game.ctx.canvas.height - gate.bh;
	}
	
	//Helper function, compares two objects' coordinates and returns true
	//if any of their edges overlap.
	function collisionDetected(x1, y1, w1, h1, x2, y2, w2, h2){
	
		return !(
			((y1 + h1) < (y2)) || 
			(y1 > (y2 + h2)) || 
			((x1 + w1) < (x2)) || 
			(x1 > (x2 + w2))
		);
	}
	
	//A Gate object
	function Gate(){
	
		this.x = 0;				//Gate's x coordinate.
		this.vx = 0;			//Gate's horizontal velocity.
		this.ty = 0;			//Top gate y coordinate.
		this.by = 0;			//Bottom gate y coordinate.
		this.w = 0;				//Gate's width in pixels.
		this.th = 0;			//Top gate height in pixels.
		this.bh = 0;			//Bottom gate height
		this.scored = false;	//Flag if gate passed parrot with no collision.
		
	}
}

//A game asset representing the players stats.
function Stats(game){

	this.score = 0;									//Initialise stats to 0.
	this.x = ((game.ctx.canvas.width / 2) - 240);	//Set stats to middle of screen horizontaly.
	this.y = 5;										//Set stats 5 pixels down from top of screen.
	this.highScore = 0;								//Track highest score
	
	var stats = this;								//Declare a local reference
	
	//All game asset objects must have an update function.
	this.update = function(game){
		var gates = game.assets[2];
		for(var i = 0; i < gates.gateArray.length; i++){
			var gate = gates.gateArray[i];
			//if gate passed centre and not scored, up the score.
		}
	}
	
	//All game asset objects must have a  draw function.
	this.draw = function(game){
		var levels = game.assets[0];
		game.ctx.font = '36px arial';			//Set font size and family.
		game.ctx.strokeStyle = '#000';			//Set outline colour.
		game.ctx.fillStyle = '#FFF';				//Set fill colour.
		game.ctx.textBaseline = "top";					//Draw stats aligned to top.
		var text = "FPS: " + game.fps() 
					+ " Lvl: " + (levels.level)
					+ " Score: " + stats.score 
					+ " HS: " + stats.highScore;
		var width = game.ctx.measureText(text).width;
		stats.x = (game.ctx.canvas.width / 2) - Math.floor(width / 2);
		game.ctx.fillText(text, stats.x, stats.y);	//Draw stats to screen.
		game.ctx.strokeText(text, stats.x, stats.y);	//Draw stats outline.
	}
	
	//All game asset objects must have a receiveKey function.
	this.receiveKey = function(keyCode, game){
		if(keyCode == 82){						//R was pressed
			if(stats.highScore < stats.score){
				stats.highScore = stats.score;
			}
			stats.score = 0;
		}
	}	
}

function InfoScreen(game){
	
	var startText = "Press F to fly";
	var endText = "Press R to restart";

	this.x = (game.ctx.canvas.width / 2) - 100;
	this.y = 125;
	this.text = startText;
	this.visible = true;
	this.countdown = -1;
	
	this.update = function(game){
		var sprite = game.assets[1];
		if(sprite.dead){
			this.text = endText;
			this.visible = true;
		} else if (this.countdown > 0){
			this.countdown--;
		} else if(this.countdown == 0){
			this.countdown = -1;
			this.visible = false;
		}
	}
	
	this.draw = function(game){
		if(this.visible){
			game.ctx.font = '36px arial';			//Set font size and family.
			game.ctx.strokeStyle = '#000';			//Set outline colour.
			game.ctx.fillStyle = 'red';				//Set fill colour.
			var width = game.ctx.measureText(this.text).width;
			this.x = (game.ctx.canvas.width / 2) - Math.floor(width / 2);
			game.ctx.fillText(this.text, this.x, this.y)
			game.ctx.strokeText(this.text, this.x, this.y);
		}
	}
	
	this.receiveKey = function(keyCode, game){
		if(keyCode == 70 && this.countdown < 0){
			this.visible = false;
		} else if (keyCode == 82){					//R was pressed
			this.visible = true;
			this.text = startText;
		}
	}
	
	this.toast = function(msg, duration){
		this.countdown = (duration * game.fps());
		this.text = msg;
		this.visible = true;
	}
}

//Helper function to bind the keydown event listener.
//Used by the Game object.
function bindEvent(e, typ, handler) {
   if(e.addEventListener) {							//Not IE browser
      e.addEventListener(typ, handler, false);		//Listen for keyDown events.
   }else{
      e.attachEvent('on'+typ, handler);				//Must be IE browser.
   }
}

