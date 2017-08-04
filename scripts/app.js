var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var x = canvas.width / 2;
var y = canvas.height - 30;
var dx = -2;
var dy = -2;
var ballRadius = 5;
var ballSpeed = 2;

var paddleHeight = 10;
var paddleWidth = 80;
var paddleX = (canvas.width - paddleWidth) / 2;

var rightPressed = false;
var leftPressed = false;

var brickRowCount = 5;
var brickColumnCount = 11;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 70;
var brickOffsetLeft = 15;
var brickColour;
var brickScore;

var highScore;
var score = 0;
var numBricksHit = 0;
var lives = 3;

var bricks = [];

function setUpBricks() {
  for (column = 0; column < brickColumnCount; column++) {
    bricks[column] = [];
    for (row = 0; row < brickRowCount; row++) {
      bricks[column][row] = { x: 0, y: 0, status: 1, score: 1 };
    }
  }
}

function setBrickColourAndScore(row) {
  switch (row) {
    case 0:
      brickScore = 50;
      brickColour = '#0200cc';
      break;
    case 1:
      brickScore = 40;
      brickColour = '#ff0002';
      break;
    case 2:
      brickScore = 30;
      brickColour = '#00ff03';
      break;
    case 3:
      brickScore = 20;
      brickColour = '#01fffe';
      break;
    case 4:
      brickScore = 10;
      brickColour = '#ffff00';
      break;
  }
}

function drawBricks() {
  for (column = 0; column < brickColumnCount; column++) {
    for (row = 0; row < brickRowCount; row++) {
      if (bricks[column][row].status == 1) {
        var brickX = (column * (brickWidth + brickPadding)) + brickOffsetLeft;
        var brickY = (row * (brickHeight + brickPadding)) + brickOffsetTop;
        setBrickColourAndScore(row);

        bricks[column][row].x = brickX;
        bricks[column][row].y = brickY;
        bricks[column][row].score = brickScore;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = brickColour;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (column = 0; column < brickColumnCount; column++) {
    for (row = 0; row < brickRowCount; row++) {
      var brick = bricks[column][row];
      if (brick.status == 1) {
        if (x > brick.x && x < brick.x + brickWidth &&
            y > brick.y && y < brick.y + brickHeight) {
          dy = -dy;
          brick.status = 0;
          score += brick.score;
          numBricksHit++;
          if (numBricksHit == brickRowCount * brickColumnCount) {
            setUpBricks();
            numBricksHit = 0;
            y = canvas.height - paddleHeight;
            x = paddleX + (paddleWidth / 2);
            ballSpeed++;
          }
        }
      }
    }
  }
}

function updateHighScore() {
  var jsonString = localStorage.getItem('breakoutHighScore');
  if (jsonString === null) {
    highScore = 0;
  } else {
    highScore = JSON.parse(jsonString);
  }

  if (score > highScore) {
    highScore = score;
    var jsonString = JSON.stringify(highScore);
    localStorage.setItem('breakoutHighScore', jsonString);
  }
}

function drawScore() {
  ctx.font = '16px ZX-Spectrum';
  ctx.fillStyle = '#0200cc';
  ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
  ctx.font = '16px ZX-Spectrum';
  ctx.fillStyle = '#0200cc';
  ctx.fillText('Lives: ' + lives, canvas.width - 140, 20);
}

function drawHighScore() {
  ctx.font = '16px ZX-Spectrum';
  ctx.fillStyle = '#0200cc';
  ctx.fillText('High Score: ' + highScore, canvas.width - 600, 20);
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#0200cc';
  ctx.fill();
  ctx.closePath();
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true;
  }
  else if (e.keyCode == 37) {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  }
  else if (e.keyCode == 37) {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0200cc';
  ctx.fill();
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawBricks();
  drawPaddle();
  drawScore();
  drawLives();
  updateHighScore();
  drawHighScore();

  collisionDetection();

  if (x + dx > canvas.width || x + dx < 0) {
    dx = -dx;
  }

  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      //ball hits paddle - check if it hits left, right, or centre
      var paddleCentre = paddleX + (paddleWidth / 2);
      if (x == paddleCentre) {
        dx = 0;
      } else if (x > paddleCentre) {
        dx = ballSpeed;
      } else if (x < paddleCentre) {

        dx = -ballSpeed;
      }
      dy = -dy;
    }
    else {
      lives--;
      if (!lives) {
          alert('GAME OVER!\n You scored ' + score + ' points');
          document.location.reload();
      }
      else {
          x = canvas.width / 2;
          y = canvas.height - 30;
          dx = ballSpeed;
          dy = -2;
          paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  }
  else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }
  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

setUpBricks();
draw();
