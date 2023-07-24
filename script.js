const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "white";
ctx.font = "40px Helvetiva";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.lineWidth = 3;

class Player {
  constructor(game) {
    this.game = game;
    this.img = new Image();
    this.img.src = "./img/bull.png";
    this.spriteWidth = 255;
    this.spriteHeight = 255;
    this.frameX = 0;
    this.maxFrameX = 59;
    this.frameY = 2;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.size = 80;
    this.radius = 30;
    this.speedX = 0;
    this.speedY = 0;
    this.dx = 0;
    this.dy = 0;
    this.speedModifier = 5;
  }
  draw(ctx) {
    ctx.drawImage(
      this.img,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - this.size,
      this.y - this.size - 50,
      this.size * 2,
      this.size * 2
    );
    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    ctx.globalAlpha = 0.5;
    if (this.game.debug) ctx.fill();
    ctx.restore();
    if (this.game.debug) ctx.stroke();
  }
  update(deltaTime) {
    if (this.y <= this.game.height * 0.4) this.y = this.game.height * 0.4;
    this.dx = this.game.mouse.x - this.x;
    this.dy = this.game.mouse.y - this.y;
    const dist = Math.hypot(this.dy, this.dx);
    if (dist > this.speedModifier) {
      this.speedX = this.dx / dist || 0;
      this.speedY = this.dy / dist || 0;
    } else {
      this.speedX = 0;
      this.speedY = 0;
    }
    this.x += this.speedX * this.speedModifier;
    this.y += this.speedY * this.speedModifier;

    // collision
    this.game.obstacles.forEach((obstacle) => {
      let [collision, dist, sumOfRadii, dx, dy] = this.game.checkCollision(
        this,
        obstacle
      );

      if (collision) {
        const unit_x = dx / dist;
        const unit_y = dy / dist;
        this.x = obstacle.x + (sumOfRadii + 1) * unit_x;
        this.y = obstacle.y + (sumOfRadii + 1) * unit_y;
      }
    });
    // frame animation
    this.frameX++;
    this.frameX %= this.maxFrameX;
    const angle = Math.atan2(this.dy, this.dx);
    if (angle < -2.74 || angle > 2.74) this.frameY = 6;
    else if (angle < -1.96) this.frameY = 7;
    else if (angle < -1.17) this.frameY = 0;
    else if (angle < -0.39) this.frameY = 1;
    else if (angle < 0.39) this.frameY = 2;
    else if (angle < 1.17) this.frameY = 3;
    else if (angle < 1.96) this.frameY = 4;
    else if (angle < 2.74) this.frameY = 5;
  }
}
class Enemy {
  constructor(game) {
    this.game = game;
    this.radius = 30;
    this.x = this.game.width - this.radius;
    this.y = Math.random() * this.game.height * 0.68 + this.game.height * 0.3;
    this.speed = Math.random() * 3 + 1;
    this.img = new Image();
    this.img.src = "./img/toadskin.png";
    this.spriteWidth = 154;
    this.spriteHeight = 238;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 3);
    this.maxFrame = 39;
  }
  draw(ctx) {
    ctx.drawImage(
      this.img,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - this.radius - 5,
      this.y - this.radius - 70,
      this.width * 0.5,
      this.height * 0.5
    );

    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = "purple";
    ctx.fillStyle = "purple";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    ctx.globalAlpha = 0.5;
    if (this.game.debug) ctx.fill();
    ctx.restore();
    if (this.game.debug) ctx.stroke();
  }

  update() {
    this.x -= this.speed;
    if (this.x + this.width <= 0) {
      this.x = this.game.width + this.radius;
      this.frameY = Math.floor(Math.random() * 3);
      this.y = Math.random() * this.game.height * 0.68 + this.game.height * 0.3;
    }

    let collisionObjects = [this.game.player, ...this.game.obstacles];

    collisionObjects.forEach((object) => {
      let [collision, dist, sumOfRadii, dx, dy] = this.game.checkCollision(
        this,
        object
      );
      if (collision) {
        const unit_x = dx / dist;
        const unit_y = dy / dist;
        this.x = object.x + (sumOfRadii + 1) * unit_x;
        this.y = object.y + (sumOfRadii + 1) * unit_y;
      }
    });

    this.frameX++;
    this.frameX %= this.maxFrame;
  }
}

class Egg {
  constructor(game) {
    this.game = game;
    this.radius = 30;
    this.img = new Image();
    this.img.src = "./img/egg.png";
    this.spriteWidth = 110;
    this.spriteHeight = 135;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.x = Math.random() * this.game.width * 0.975 + this.game.width * 0.015;
    this.y = Math.random() * this.game.height * 0.6 + this.game.height * 0.35;
    this.hatchTimer = 0;
    this.hatchInterval = 5000;
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.drawImage(
      this.img,
      0,
      0,
      this.width,
      this.height,
      this.x - this.width * 0.5 + 20,
      this.y - this.height * 0.5 + 20,
      this.width * 0.6,
      this.height * 0.6
    );

    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.globalAlpha = 0.5;
    if (this.game.debug) ctx.fill();
    ctx.restore();
    if (this.game.debug) ctx.stroke();
    const displayTime = (this.hatchTimer * 0.001).toFixed(0);
    ctx.fillText(displayTime, this.x, this.y - this.radius * 2.3);
  }
  update(deltaTime) {
    let collisionObjects = [
      this.game.player,
      ...this.game.obstacles,
      ...this.game.enemies,
    ];

    collisionObjects.forEach((object) => {
      let [collision, dist, sumOfRadii, dx, dy] = this.game.checkCollision(
        this,
        object
      );
      if (collision) {
        const unit_x = dx / dist;
        const unit_y = dy / dist;
        this.x = object.x + (sumOfRadii + 1) * unit_x;
        this.y = object.y + (sumOfRadii + 1) * unit_y;
      }
    });

    if (this.hatchTimer > this.hatchInterval) {
      this.hacthTimer = 0;
      this.markedForDeletion = true;
      this.game.removeGameObject();
      this.game.hatchlings.push(new Larva(this.game, this.x, this.y));
    } else {
      this.hatchTimer += deltaTime;
    }
  }
}

class Larva {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.img = new Image();
    this.img.src = "./img/larva_sprite.png";
    this.radius = 20;
    this.spriteWidth = 150;
    this.spriteHeight = 150;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.speed = Math.random() * 3 + 1;
    this.frameY = Math.floor(Math.random() * 2);
    this.frameX = 0;
    this.maxFrame = 39;
    this.markedForDeletion = false;
  }
  draw(ctx) {
    ctx.drawImage(
      this.img,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.width,
      this.height,
      this.x - this.width * 0.25,
      this.y - this.height * 0.35,
      this.width * 0.5,
      this.height * 0.5
    );

    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "yellow";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.globalAlpha = 0.5;
    if (this.game.debug) ctx.fill();
    ctx.restore();
    if (this.game.debug) ctx.stroke();
  }
  update() {
    this.y -= this.speed;

    if (this.y <= this.game.height * 0.3) {
      this.markedForDeletion = true;
      this.game.removeGameObject();
      this.game.score++;
      for (let i = 0; i < 10; i++) {
        this.game.particles.push(
          new Firefly(this.game, this.x, this.y, "yellow")
        );
      }
    }

    let collisionObjects = [
      this.game.player,
      ...this.game.obstacles,
      ...this.game.eggs,
    ];

    collisionObjects.forEach((object) => {
      let [collision, dist, sumOfRadii, dx, dy] = this.game.checkCollision(
        this,
        object
      );
      if (collision) {
        const unit_x = dx / dist;
        const unit_y = dy / dist;
        this.x = object.x + (sumOfRadii + 1) * unit_x;
        this.y = object.y + (sumOfRadii + 1) * unit_y;
      }
    });

    this.game.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)[0]) {
        this.markedForDeletion = true;
        this.game.removeGameObject();
        this.game.lostHatchlings++;
        for (let i = 0; i < 10; i++) {
          this.game.particles.push(new Spark(this.game, this.x, this.y, "red"));
        }
      }
    });

    this.frameX++;
    this.frameX %= this.maxFrame;
  }
}

class Obstacle {
  constructor(game) {
    this.game = game;
    this.x = Math.random() * this.game.width * 0.975 + this.game.width * 0.015;
    this.y = Math.random() * this.game.height * 0.6 + this.game.height * 0.35;
    this.radius = 20;
    this.img = new Image();
    this.img.src = "./img/obstacles.png";
    this.frameX = Math.floor(Math.random() * 4);
    this.frameY = Math.floor(Math.random() * 3);
    this.spriteWidth = 250;
    this.spriteHeight = 250;
    this.width = 150;
    this.height = 150;
  }
  draw(ctx) {
    ctx.drawImage(
      this.img,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - this.width * 0.5,
      this.y - this.height * 0.5 - 50,
      this.width,
      this.height
    );
    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.globalAlpha = 0.5;
    if (this.game.debug) ctx.fill();
    ctx.restore();
    if (this.game.debug) ctx.stroke();
  }
  update() {}
}

class Particle {
  constructor(game, x, y, color) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.floor(Math.random() * 6 + 5);
    this.speedX = Math.random() * 3 + 1;
    this.speedY = Math.random() * 3 + 0.5;
    this.angle = 0;
    this.va = Math.random() * 0.6 + 0.05;
    this.markedForDeletion = false;
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
class Firefly extends Particle {
  update() {
    this.angle += this.va;
    this.x += Math.cos(this.angle) * this.speedX;
    this.y -= this.speedY;
    this.radius -= 0.04;
    if (this.y < 0 - this.radius || this.radius < 0.1) {
      this.markedForDeletion = true;
      this.game.removeGameObject();
    }
  }
}
class Spark extends Particle {
  update() {
    this.angle += this.va * 0.5;
    this.x -= Math.cos(this.angle) * this.speedX ;
    this.y -= Math.sin(this.angle) * this.speedY;
    if (this.radius > 0.1) this.radius -= 0.06;
    if (this.radius < 0.2){
       this.markedForDeletion = true;
       this.game.removeGameObject();
      }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.player = new Player(this);
    this.obstacles = [];
    this.numberOfObstacles = 5;
    this.eggs = [];
    this.maxEggs = 10;
    this.gameObjects = [];
    this.enemies = [];
    this.hatchlings = [];
    this.particles = [];
    this.numberOfenemies = 30;
    this.bg = new Image();
    this.bg.src = "./img/background.png";
    this.fg = new Image();
    this.fg.src = "./img/overlay.png";
    this.score = 0;
    this.lostHatchlings = 0;
    this.mouse = {
      x: this.width * 0.5,
      y: this.height * 0.5,
      pressed: false,
    };
    this.debug = false;
    this.fps = 100;
    this.timer = 0;
    this.interval = 1000 / this.fps;
    this.eggTimer = 0;
    this.eggInterval = 1500;

    window.addEventListener("mousedown", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
      this.mouse.pressed = true;
    });
    window.addEventListener("mouseup", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
      this.mouse.pressed = false;
    });
    window.addEventListener("mousemove", (e) => {
      if (this.mouse.pressed) {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
      }
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "d") this.debug = !this.debug;
    });
  }
  draw(ctx, deltaTime) {
    if (this.timer > this.interval) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this.bg, 0, 0, this.width, this.height);

      this.gameObjects = [
        ...this.eggs,
        ...this.obstacles,
        ...this.enemies,
        ...this.hatchlings,
        ...this.particles,
        this.player,
      ];
      this.gameObjects.sort((a, b) => {
        return a.y - b.y;
      });

      this.gameObjects.forEach((object) => {
        object.draw(ctx);
        object.update(deltaTime);
      });

      ctx.drawImage(this.fg, 0, 0, this.width, this.height);
      this.timer = 0;
    }
    this.timer += deltaTime;

    if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs) {
      this.addEgg();
      this.eggTimer = 0;
    } else {
      this.eggTimer += deltaTime;
    }
    ctx.save();
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${this.score}`, 25, 50);
    if (this.debug) ctx.fillText(`Lost: ${this.lostHatchlings}`, 25, 80);
    ctx.restore();
  }
  checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.hypot(dy, dx);
    const sumOfRadii = a.radius + b.radius;
    return [dist < sumOfRadii, dist, sumOfRadii, dx, dy];
  }

  addEnemy() {
    this.enemies.push(new Enemy(this));
  }
  addEgg() {
    this.eggs.push(new Egg(this));
  }
  removeGameObject() {
    this.eggs = this.eggs.filter((object) => !object.markedForDeletion);
    this.hatchlings = this.hatchlings.filter(
      (object) => !object.markedForDeletion
    );
    this.particles = this.particles.filter(
      (particle) => !particle.markedForDeletion
    );
  }

  init() {
    for (let i = 0; i < this.numberOfenemies; i++) {
      this.addEnemy();
    }
    let attempts = 0;
    while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
      let testObstacle = new Obstacle(this);
      let overlap = false;
      this.obstacles.forEach((obstacle) => {
        const dx = testObstacle.x - obstacle.x;
        const dy = testObstacle.y - obstacle.y;
        const dist = Math.hypot(dy, dx);
        const distanceBuffer = 100;
        const sumOfRadii =
          testObstacle.radius + obstacle.radius + distanceBuffer;
        if (dist < sumOfRadii) {
          overlap = true;
        }
      });
      if (!overlap) {
        this.obstacles.push(testObstacle);
      }
      attempts++;
    }
  }
}

const game = new Game(canvas);
game.init();

let lastTime = 0;
function animate(stampTime) {
  const deltaTime = stampTime - lastTime;
  lastTime = stampTime;
  requestAnimationFrame(animate);
  game.draw(ctx, deltaTime);
}
animate(0);
