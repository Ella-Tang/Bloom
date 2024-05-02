class UIManager {
  constructor(layer, indicatorLayer) {
    this.layer = layer;
    this.indicatorLayer = indicatorLayer;
    this.barHeight = 50;
    this.colWidth = windowWidth / 3;
    this.btnCallbacks = [];
    this.btnLabels = ['Clear Canvas', 'Toggle Drawing', 'Switch Background', 'Switch Drawing Mode'];
    this.currBtn = -1;
    this.handTimer = 0;
    this.timeThreshold = 1500;
    this.prevX = windowWidth / 2;
    this.prevY = windowHeight / 2;
    this.smoothFactor = 0.1;
    this.moveThreshold = 300;
  }
  
  update() {
    if (drawMode == 1) {
      if (getHandPosition()) {
        this.drawSmoothedHandIndicator(getHandPosition());
        this.checkInteraction();
      } else {
        this.clearIndicator();
      } 
    } else {
      this.clearIndicator();
    }
  }
  
  setMessage(message) {
    this.message = message;
    this.messageStartTime = millis();
  }
  
  drawSmoothedHandIndicator(handPosition) {
    let smoothedX = lerp(this.prevX, handPosition.x, this.smoothFactor);
    let smoothedY = lerp(this.prevY, handPosition.y, this.smoothFactor); 
    if (dist(this.prevX, this.prevY, smoothedX, smoothedY) < this.moveThreshold) {
      this.prevX = smoothedX;
      this.prevY = smoothedY;
    } else {
      this.prevX = lerp(this.prevX, handPosition.x, this.smoothFactor * 1.5);
      this.prevY = lerp(this.prevY, handPosition.y, this.smoothFactor * 1.5);
    }    
    this.drawHandIndicator(this.prevX, this.prevY);
  }
  
  drawHandIndicator(x, y) {
    this.indicatorLayer.push();
    this.indicatorLayer.clear();
    this.indicatorLayer.strokeWeight(3);
    this.indicatorLayer.fill(255, 255, 255, 128);
    this.indicatorLayer.noStroke();
    this.indicatorLayer.ellipse(x, y, 60, 60);
    this.indicatorLayer.pop();
  }
  
  checkInteraction() {
    let currBtn = this.getYBtnIdx(this.prevY);
    if (currBtn !== this.currBtn) {
        this.currBtn = currBtn;
        this.handTimer = new Date().getTime();
    } else if (this.handTimer && (new Date().getTime() - this.handTimer > this.timeThreshold)) {
        if (currBtn !== -1 && this.btnCallbacks[currBtn] && typeof this.btnCallbacks[currBtn] === 'function') {
            this.btnCallbacks[currBtn]();
            this.handTimer = new Date().getTime(); 
        }
    } else if (currBtn === -1) {
      this.currBtn = -1;
      this.handTimer = null;
    }
  }

  getYBtnIdx(y) {
    if (y <= this.barHeight) return Math.floor(this.prevX / this.colWidth);
    if (y >= windowHeight - this.barHeight && y < windowHeight) return 3;
    return -1;
  }
  
  clearIndicator() {
    this.indicatorLayer.clear();
    this.currBtn = -1;
    this.handTimer = null;
  }
  
  setBtnCallbacks(callbacks) {
    this.btnCallbacks = callbacks;
  }

  handleMousePress(x, y) {
    if (y <= this.barHeight) {
      let currBtn = Math.floor(x / this.colWidth);
      if (currBtn >= 0 && currBtn < this.btnCallbacks.length && this.btnCallbacks[currBtn]) {
        console.log("Clicked button:", this.btnLabels[currBtn]);
        this.btnCallbacks[currBtn]();
      }
    }
    if (y >= windowHeight - this.barHeight && y < windowHeight) {
      console.log("Clicked button: Switch Drawing Mode");
      this.btnCallbacks[3]();
    }
  }
  
  show() {
    this.layer.push();  
    this.drawUIBars();
    this.stylizeText();
    this.showBtnLabel();
    this.layer.pop();
  }

  drawUIBars() {
    this.layer.fill(this.getTopBarColor());
    this.layer.stroke(0);
    this.layer.strokeWeight(4);
    this.layer.rect(2, 2, windowWidth - 4, this.barHeight + 2);
    this.layer.rect(2, windowHeight - this.barHeight - 2, windowWidth - 4, this.barHeight);
    this.layer.stroke(0);
    for (let i = 1; i <= 2; i++) {
      this.layer.line(i * this.colWidth, 2, i * this.colWidth, this.barHeight + 2);
    }
  }
  
  stylizeText() {    
    this.layer.strokeWeight(0.3);
    this.layer.textSize(18)
    this.layer.textAlign(CENTER, CENTER);
    this.layer.fill(0);
  }
  
  showBtnLabel() {
    this.btnLabels[1] = isDrawing ? "Pause" : "Start";
    for (let i = 0; i < this.btnLabels.length; i++) {
      if (i < 3) {
        this.layer.text(this.btnLabels[i], (i + 0.5) * this.colWidth, this.barHeight / 2 + 2);
      } else {
        this.layer.text(this.btnLabels[i], windowWidth / 2, windowHeight - this.barHeight / 2);
      }
    }  
  }
  
  getTopBarColor() {
    let uiR = red(currentBackgroundColor);
    let uiG = green(currentBackgroundColor);
    let uiB = blue(currentBackgroundColor);
    let uiA = alpha(currentBackgroundColor);
    let washAmount = 0.2; 
    let avg = (uiR + uiG + uiB) / 3;
    uiR = lerp(uiR, avg, washAmount);
    uiG = lerp(uiG, avg, washAmount);
    uiB = lerp(uiB, avg, washAmount);
    uiR *= (1 - washAmount);
    uiG *= (1 - washAmount);
    uiB *= (1 - washAmount);
    return color(uiR, uiG, uiB, uiA);
  }
}