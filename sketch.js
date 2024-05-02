const COLOR_PALETTE = [ {r: 117, g: 185, b: 190, a: 1}, {r: 105, g: 109, b: 125, a: 1},
  {r: 215, g: 38, b: 56, a: 1}, {r: 244, g: 157, b: 55, a: 1},
  {r: 244, g: 195, b: 135, a: 1}, {r: 144, g: 64, b: 40, a: 1},
  {r: 21, g: 76, b: 100, a: 1}, {r: 141, g: 164, b: 151, a: 1},
  {r: 89, g: 135, b: 77, a: 1}, {r: 46, g: 119, b: 103, a: 1}];

let bgm;
let videoManager, handTracker, uiManager, graphicsManager;
let layer1, layer2, layer3, layer4;
let isDrawing = false, isRandomBackground = false;
let canvasBackground = (25, 120); 
let drawMode = 2;
let currentBackgroundColor = canvasBackground;
let isMobile = false;

function preload() { 
  bgm = loadSound('lemonade.mp3');
}

function setup() {
  if (window.mobileAndTabletCheck() == true) isMobile = true;
  createCanvas(windowWidth, windowHeight);
  initLayers();
  initObjects();
  UICallback();
}

function initLayers() {
  layer1 = createGraphics(windowWidth, windowHeight);  //graphics layer
  layer2 = createGraphics(windowWidth, windowHeight);  //selection layer
  layer3 = createGraphics(windowWidth, windowHeight);  //ui layer
  layer4 = createGraphics(windowWidth, windowHeight);  //hand indicator
  layer1.background(currentBackgroundColor);
  layer2.background(0, 0);
  layer3.background(0, 0);
  drawTexture();
  layer4.background(0, 0);
}

function drawTexture() {
  for (let i = 0; i < 10000; i++) {
    let x = random(width);
    let y = random(height);
    let n = noise(x * 0.01, y * 0.01) * width * 0.03;
    layer3.stroke("rgba(234,227,210,0.17)");
    layer3.line(x + n / 2, y, x + n / 2, y + n);
    layer3.line(x, y + n / 2, x + n, y + n / 2);
  }
}

function drawInternalSpace() {
  let noiseScale = 0.01; 
  let curveIntensity = 20;
  layer1.push();
  layer1.noFill();
  layer1.stroke(0);
  layer1.strokeWeight(3);
  let trapBottomTopWidth = windowWidth * 0.8;
  let trapHeight = windowHeight * 0.2;
  let trapBottomY = windowHeight - trapHeight; 
  let trapBottomX1 = (windowWidth - trapBottomTopWidth) / 2;
  let trapBottomX2 = trapBottomX1 + trapBottomTopWidth;
  //bottom trapezoid
  layer1.beginShape();
  for (let x = trapBottomX1; x <= trapBottomX2; x += 10) {
  let offsetY = (noise(x * noiseScale) - 0.5) * curveIntensity;
  layer1.vertex(x, trapBottomY + offsetY);
  }
  layer1.vertex(windowWidth, windowHeight - 50);  //bottom right
  layer1.vertex(0, windowHeight - 50);            //bottom left
  layer1.endShape(CLOSE);
  //top trapezoid
  layer1.beginShape();
  layer1.vertex(0, 52);                       //top left
  layer1.vertex(windowWidth, 52);             //top right
  for (let x = trapBottomX2; x >= trapBottomX1; x -= 10) {
  let offsetY = (noise(x * noiseScale) - 0.5) * curveIntensity;
  layer1.vertex(x, trapHeight - offsetY + 26);
  }
  layer1.endShape(CLOSE);
  //starting line
  layer1.beginShape();
  for (let y = trapHeight; y <= trapBottomY; y += 10) {
  let offsetX = (noise(y * noiseScale) - 0.5) * curveIntensity;
  layer1.vertex(trapBottomX1 + offsetX, y + 20);
  }
  layer1.endShape();
  //end line
  layer1.beginShape();
  for (let y = trapHeight; y <= trapBottomY; y += 10) {
  let offsetX = (noise(y * noiseScale) - 0.5) * curveIntensity;
  layer1.vertex(trapBottomX2 + offsetX, y + 20);
  }
  layer1.endShape();
layer1.pop();
}

function initObjects() {
  handDetection = new HandDetection();
  uiManager = new UIManager(layer3, layer4);
  graphicsManager = new GraphicsManager(layer1, layer2);
}

function UICallback() {
  uiManager.setBtnCallbacks([
  clearCanvas,      
  toggleDrawing,
  switchBackground,
  switchDrawingMode
  ]);
}

function draw() {
  checkMobile();
  image(layer1, 0, 0);
  layer1.background(currentBackgroundColor);
  drawInternalSpace();
  image(layer2, 0, 0);
  if (drawMode == 1)  graphicsManager.updatebyHand();
  graphicsManager.drawFlowers();
  image(layer3, 0, 0);
  image(layer4, 0, 0);
  uiManager.update();
  uiManager.show();
}

function checkMobile() {
  if (isMobile) {
    drawMode = 3;
    for (let touch of touches) {
      if(isDrawing)  graphicsManager.updatebyMouse(touch.x, touch.y);
      uiManager.handleMousePress(touch.x, touch.y);
    }
  }
}

function clearCanvas() {
  layer1.clear();
  graphicsManager.clearFlowers(); 
  layer1.background(currentBackgroundColor);
}

function switchBackground() {
  isRandomBackground = !isRandomBackground;
  if (isRandomBackground) {
    let random = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    currentBackgroundColor = color(random.r, random.g, random.b, 200);
  } else {
    currentBackgroundColor = canvasBackground;
  } 
  layer1.background(currentBackgroundColor);
}

function toggleDrawing() { 
  isDrawing = !isDrawing;
  if (isDrawing) {
    console.log("Drawing started");
    playMusic();
  } else {
    console.log("Drawing paused");
    pauseMusic();
  }
}

function playMusic() {
  if (bgm.isLoaded() && !bgm.isPlaying()) bgm.loop();
}

function pauseMusic() {
  if (bgm.isPlaying()) bgm.pause();
}

function keyPressed() {
  if (drawMode != 3  && key == ' ') {
    drawMode = drawMode == 1 ? 2 : 1;
    console.log("Mode switched to: " + (drawMode === 1 ? "Hand Detection" : "Mouse Interaction"));
  }   
}

function switchDrawingMode() {
  if (isMobile) {
    drawMode = drawMode == 1 ? 3 : 1;
    showMessage("Mode switched to: " + (drawMode == 1 ? "Hand Detection" : "Touch"));
  } else {
    drawMode = drawMode == 1 ? 2 : 1;
    showMessage("Mode switched to: " + (drawMode == 1 ? "Hand Detection" : "Mouse Interaction"));
  }
  console.log("Draw mode switched to:", drawMode);
}

function showMessage(msg) {
  let messageDiv = document.getElementById('drawModeMessage');
  messageDiv.textContent = msg;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

function mousePressed() {
  if(isDrawing && drawMode == 2) {
    graphicsManager.updatebyMouse(mouseX, mouseY);
  }
  if(drawMode == 2 || drawMode == 1) {
    uiManager.handleMousePress(mouseX, mouseY);
  }
}

function touchStarted(){
  return false;
}

function touchMoved(){
  return false;
}

function touchEnded(){
  return false;
}

function touchMoved() {
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup();
  draw();
}

window.getHandPosition = function() {
  return handDetection.getHandPosition();
};

window.mobileAndTabletCheck = function() {
  let userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|playbook|silk/i.test(userAgent) || /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};
