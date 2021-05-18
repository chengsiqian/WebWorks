// 游戏数据
let gameStarted; // 布尔变量

let balloonX;
let balloonY;

let verticalVelocity; // 气球当前的垂直速度
let horizontalVelocity; // 现在气球的水平速度

let fuel; // 剩余燃油百分比
let heating; // 布尔:鼠标是否关闭?

let trees; // 数组中树的元数据
let backgroundTrees; // 背景山上树木的元数据

// 配置
const mainAreaWidth = 400;
const mainAreaHeight = 375;
let horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
let verticalPadding = (window.innerHeight - mainAreaHeight) / 2;

const hill1BaseHeight = 80;
const hill1Speed = 0.2;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 50;
const hill2Speed = 0.2;
const hill2Amplitude = 15;
const hill2Stretch = 0.5;
const hill3BaseHeight = 15;
const hill3Speed = 1;
const hill3Amplitude = 10;
const hill3Stretch = 0.2;

const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const introductionElement = document.getElementById("introduction");
const restartButton = document.getElementById("restart");

// 添加一个自定义sin函数，使用角度而不是弧度
Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

// 初始化布局
resetGame();

//重置游戏变量和布局，但不开始游戏(按下按钮游戏开始)
function resetGame() {
  // 重置游戏
  gameStarted = false;
  heating = false;
  verticalVelocity = 5;
  horizontalVelocity = 5;
  balloonX = 0;
  balloonY = 0;
  fuel = 100;

  introductionElement.style.opacity = 1;
  restartButton.style.display = "none";

  trees = [];
  for (let i = 1; i < window.innerWidth / 50; i++) generateTree();

  backgroundTrees = [];
  for (let i = 1; i < window.innerWidth / 30; i++) generateBackgroundTree();

  draw();
}

function generateBackgroundTree() {
  const minimumGap = 30;
  const maximumGap = 150;

  //最远的树的右边缘的X坐标
  const lastTree = backgroundTrees[backgroundTrees.length - 1];
  let furthestX = lastTree ? lastTree.x : 0;

  const x =
    furthestX +
    minimumGap +
    Math.floor(Math.random() * (maximumGap - minimumGap));

  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  backgroundTrees.push({ x, color });
}

function generateTree() {
  const minimumGap = 50; // 两颗树之间的最小距离
  const maximumGap = 600; //两颗树之间的最大距离

  const x = trees.length
    ? trees[trees.length - 1].x +
      minimumGap +
      Math.floor(Math.random() * (maximumGap - minimumGap))
    : 400;

  const h = 60 + Math.random() * 80; // 高度

  const r1 = 32 + Math.random() * 16; // 半径
  const r2 = 32 + Math.random() * 16;
  const r3 = 32 + Math.random() * 16;
  const r4 = 32 + Math.random() * 16;
  const r5 = 32 + Math.random() * 16;
  const r6 = 32 + Math.random() * 16;
  const r7 = 32 + Math.random() * 16;

  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  trees.push({ x, h, r1, r2, r3, r4, r5, r6, r7, color });
}

resetGame();

// 如果按下空格键，重新启动游戏
window.addEventListener("keydown", function (event) {
  if (event.key == " ") {
    event.preventDefault();
    resetGame();
    return;
  }
});

window.addEventListener("mousedown", function () {
  heating = true;

  if (!gameStarted) {
    introductionElement.style.opacity = 0;
    gameStarted = true;
    window.requestAnimationFrame(animate);
  }
});

window.addEventListener("mouseup", function () {
  heating = false;
});

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  horizontalPadding = (window.innerWidth - mainAreaWidth) / 2;
  verticalPadding = (window.innerHeight - mainAreaHeight) / 2;
  draw();
});

// 游戏主循环
function animate() {
  if (!gameStarted) return;

  const velocityChangeWhileHeating = 0.4;
  const velocityChangeWhileCooling = 0.2;

  if (heating && fuel > 0) {
    if (verticalVelocity > -8) {
      //限制最大上升速度
      verticalVelocity -= velocityChangeWhileHeating;
    }
    fuel -= 0.002 * -balloonY;
  } else if (verticalVelocity < 5) {
    // 限制最大下降速度
    verticalVelocity += velocityChangeWhileCooling;
  }

  balloonY += verticalVelocity; // 气球上下移动
  if (balloonY > 0) balloonY = 0; // 气球落地
  if (balloonY < 0) balloonX += horizontalVelocity; //如果气球不在地面上，则向右移动

  // 如果一棵树移出了画面，就用一棵新的代替它
  if (trees[0].x - (balloonX - horizontalPadding) < -100) {
    trees.shift(); // 删除数组中的第一项
    generateTree(); // 向数组中添加一个新项
  }

  // 如果背景山上的一棵树移出了画面，就用一棵新的取代它
  if (
    backgroundTrees[0].x - (balloonX * hill1Speed - horizontalPadding) <
    -40
  ) {
    backgroundTrees.shift(); //删除数组中的第一项
    generateBackgroundTree(); // 向数组中添加一个新项
  }

  draw(); // 重新渲染整个场景

  // 如果气球撞到一棵树或耗尽燃料并着陆，那么游戏就会停止
  const hit = hitDetection();
  if (hit || (fuel <= 0 && balloonY >= 0)) {
    restartButton.style.display = "block";
    return;
  }

  window.requestAnimationFrame(animate);
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawSky(); // 用渐变填充背景

  ctx.save();
  ctx.translate(0, verticalPadding + mainAreaHeight);
  drawBackgroundHills();

  ctx.translate(horizontalPadding, 0);

  // 将主画布区域置于屏幕中间
  ctx.translate(-balloonX, 0);

  // 画场景
  drawTrees();
  drawBalloon();

  // 恢复转换
  ctx.restore();

  // Header是最后一个，因为它在其他所有东西之上
  drawHeader();
}

restartButton.addEventListener("click", function (event) {
  event.preventDefault();
  resetGame();
  restartButton.style.display = "none";
});

function drawCircle(cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawTrees() {
  trees.forEach(({ x, h, r1, r2, r3, r4, r5, r6, r7, color }) => {
    ctx.save();
    ctx.translate(x, 0);

    // 树干
    const trunkWidth = 40;
    ctx.fillStyle = "#885F37";
    ctx.beginPath();
    ctx.moveTo(-trunkWidth / 2, 0);
    ctx.quadraticCurveTo(-trunkWidth / 4, -h / 2, -trunkWidth / 2, -h);
    ctx.lineTo(trunkWidth / 2, -h);
    ctx.quadraticCurveTo(trunkWidth / 4, -h / 2, trunkWidth / 2, 0);
    ctx.closePath();
    ctx.fill();

    // 树冠
    ctx.fillStyle = color;
    drawCircle(-20, -h - 15, r1);
    drawCircle(-30, -h - 25, r2);
    drawCircle(-20, -h - 35, r3);
    drawCircle(0, -h - 45, r4);
    drawCircle(20, -h - 35, r5);
    drawCircle(30, -h - 25, r6);
    drawCircle(20, -h - 15, r7);

    ctx.restore();
  });
}

function drawBalloon() {
  ctx.save();

  ctx.translate(balloonX, balloonY);

  // 车
  ctx.fillStyle = "#DB504A";
  ctx.fillRect(-30, -40, 60, 10);
  ctx.fillStyle = "#EA9E8D";
  ctx.fillRect(-30, -30, 60, 30);

  // 电缆
  ctx.strokeStyle = "#D62828";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, -40);
  ctx.lineTo(-24, -60);
  ctx.moveTo(24, -40);
  ctx.lineTo(24, -60);
  ctx.stroke();

  // 气球
  ctx.fillStyle = "#D62828";
  ctx.beginPath();
  ctx.moveTo(-30, -60);
  ctx.quadraticCurveTo(-80, -120, -80, -160);
  ctx.arc(0, -160, 80, Math.PI, 0, false);
  ctx.quadraticCurveTo(80, -120, 30, -60);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHeader() {
  // 燃油表
  ctx.strokeStyle = fuel <= 30 ? "red" : "white";
  ctx.strokeRect(30, 30, 150, 30);
  ctx.fillStyle = fuel <= 30 
    ? "rgba(255,0,0,0.5)" 
    : "rgba(150,150,200,0.5)";
  ctx.fillRect(30, 30, (150 * fuel) / 100, 30);

  // 分数
  const score = Math.floor(balloonX / 30);
  ctx.fillStyle = "black";
  ctx.font = "bold 32px Tahoma";
  ctx.textAlign = "end";
  ctx.textBaseline = "top";
  ctx.fillText(`${score} m`, window.innerWidth - 30, 30);
}

function drawSky() {
  var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#AADBEA");
  gradient.addColorStop(1, "#FEF1E1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawBackgroundHills() {
  // 画山
  drawHill(
    hill1BaseHeight,
    hill1Speed,
    hill1Amplitude,
    hill1Stretch,
    "#AAD155" // #95C629"
  );
  drawHill(
    hill2BaseHeight,
    hill2Speed,
    hill2Amplitude,
    hill2Stretch,
    "#84B249" // "#659F1C"
  );

  drawHill(
    hill3BaseHeight,
    hill3Speed,
    hill3Amplitude,
    hill3Stretch,
    "#26532B"
  );

  // 画背景树
  backgroundTrees.forEach((tree) => drawBackgroundTree(tree.x, tree.color));
}

// 山是在伸展的窦波下的形状
function drawHill(baseHeight, speedMultiplier, amplitude, stretch, color) {
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i <= window.innerWidth; i++) {
    ctx.lineTo(i, getHillY(i, baseHeight, speedMultiplier, amplitude, stretch));
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBackgroundTree(x, color) {
  ctx.save();
  ctx.translate(
    (-balloonX * hill1Speed + x) * hill1Stretch,
    getTreeY(x, hill1BaseHeight, hill1Amplitude)
  );

  const treeTrunkHeight = 5;
  const treeTrunkWidth = 2;
  const treeCrownHeight = 25;
  const treeCrownWidth = 10;

  // 画树干
  ctx.fillStyle = "#7D833C";
  ctx.fillRect(
    -treeTrunkWidth / 2,
    -treeTrunkHeight,
    treeTrunkWidth,
    treeTrunkHeight
  );

  // 画树冠
  ctx.beginPath();
  ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
  ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
  ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function getHillY(x, baseHeight, speedMultiplier, amplitude, stretch) {
  const sineBaseY = -baseHeight;
  return (
    Math.sinus((balloonX * speedMultiplier + x) * stretch) * amplitude +
    sineBaseY
  );
}

function getTreeY(x, baseHeight, amplitude) {
  const sineBaseY = -baseHeight;
  return Math.sinus(x) * amplitude + sineBaseY;
}

function hitDetection() {
  const cartBottomLeft = { x: balloonX - 30, y: balloonY };
  const cartBottomRight = { x: balloonX + 30, y: balloonY };
  const cartTopRight = { x: balloonX + 30, y: balloonY - 40 };

  for (const { x, h, r1, r2, r3, r4, r5 } of trees) {
    const treeBottomLeft = { x: x - 20, y: -h - 15 };
    const treeLeft = { x: x - 30, y: -h - 25 };
    const treeTopLeft = { x: x - 20, y: -h - 35 };
    const treeTop = { x: x, y: -h - 45 };
    const treeTopRight = { x: x + 20, y: -h - 35 };

    if (getDistance(cartBottomLeft, treeBottomLeft) < r1) return true;
    if (getDistance(cartBottomRight, treeBottomLeft) < r1) return true;
    if (getDistance(cartTopRight, treeBottomLeft) < r1) return true;

    if (getDistance(cartBottomLeft, treeLeft) < r2) return true;
    if (getDistance(cartBottomRight, treeLeft) < r2) return true;
    if (getDistance(cartTopRight, treeLeft) < r2) return true;

    if (getDistance(cartBottomLeft, treeTopLeft) < r3) return true;
    if (getDistance(cartBottomRight, treeTopLeft) < r3) return true;
    if (getDistance(cartTopRight, treeTopLeft) < r3) return true;

    if (getDistance(cartBottomLeft, treeTop) < r4) return true;
    if (getDistance(cartBottomRight, treeTop) < r4) return true;
    if (getDistance(cartTopRight, treeTop) < r4) return true;

    if (getDistance(cartBottomLeft, treeTopRight) < r5) return true;
    if (getDistance(cartBottomRight, treeTopRight) < r5) return true;
    if (getDistance(cartTopRight, treeTopRight) < r5) return true;
  }
}

function getDistance(point1, point2) {
  return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
}