class GraphicsManager {
  constructor(layer, markLayer) {
    this.layer = layer;
    this.markLayer = markLayer;
    this.flowers = [];
    this.selectedFlower = null;
    this.timeThreshold = 2000;  //2 sec
    this.handTimer = null;
  }
  
  //update graphics based on hand detection (called from main)
  updatebyHand() {
    let handPosition = getHandPosition();
    if (handPosition && isDrawing) {
      if (this.isWithinDrawingArea(handPosition)) {
        if (this.handTimer === null) {
          this.handTimer = new Date().getTime();
          console.log("Timer started for hand");
        } else if (new Date().getTime() - this.handTimer >= this.timeThreshold) {
          this.markLayer.clear();
          if (!this.isFlowerSelected(handPosition)) {
            this.createNewFlower(handPosition);
          }
          this.handTimer = null;
        }
      } else {
        this.handTimer = null;
      }
    } else {
      this.handTimer = null;
    }
  }
  
  //update graphics based on mouse interaction (called from main)
  updatebyMouse(x, y) {
    if (this.isWithinDrawingArea({x, y})) {
      if (isDrawing)  this.markLayer.clear();
      if (!this.isFlowerSelected({x, y})) {
        this.createNewFlower({x, y});
      }
    }
  }
  
  //draw all the flowers (called from main)
  drawFlowers() {
    let i = 0;
    while (i < this.flowers.length) {
      this.flowers[i].drawFlower();  
      if (this.flowers[i].isOffScreen()) {
        this.flowers.splice(i, 1);
      } else {
        i++;
      }
    }
  }
  
  //clear all the flowers (called from main)
  clearFlowers() { 
    this.flowers = [];
    this.markLayer.clear();
    this.selectedFlower = null;
  }

  //creating new flower based on genetics or random dna
  createNewFlower(handPosition) {
    let distBetween = windowWidth / 20;
    if (this.isPositionValid(handPosition, distBetween)) {
      let dna = this.selectedFlower ? this.selectedFlower.dna.getClone() : new DNA();
      let newFlower = new Flower(handPosition, this.layer, dna);
      this.flowers.push(newFlower);
      console.log(`A new flower created with ${this.selectedFlower ? "cloned genes" : "random genes"}`);
      console.log(`There are ${this.flowers.length} flower(s) now`);      
      if (this.selectedFlower)  this.selectedFlower.startLeaving();
      this.selectedFlower = null;
      console.log("Selection is reset")
    }
  }
  
  //check if flower selected
  isFlowerSelected(handPosition) {
    for (let flower of this.flowers) {
      if (dist(handPosition.x, handPosition.y, flower.x, flower.y) < flower.diameter / 2) {
        this.selectedFlower = flower;
        this.markSelected(flower.x, flower.y, flower.diameter);
        console.log("Selection is made");
        return true;
      }
    }
    return false;
  }
  
  //mark on selected flower
  markSelected(x, y, d) {
    this.markLayer.push();
    this.markLayer.clear();
    this.markLayer.stroke(0);
    this.markLayer.strokeWeight(3);
    this.markLayer.noFill();
    this.markLayer.circle(x, y, d * 1.2);
    this.markLayer.pop();
  }
  
  //helper to check if position is valid to place new flower
  isPositionValid(handPosition, minDistance) {
    for (let flower of this.flowers) {
      if (dist(handPosition.x, handPosition.y, flower.x, flower.y) < minDistance) {
        console.log("Unable to create, position too close to another");
        return false;
      }
    }
    return true;
  }

  //helper for creating only within drawing area
  isWithinDrawingArea({x, y}) {
    const barHeight = 100;
    return x >= 0 && x <= windowWidth && y >= barHeight && y <= windowHeight - barHeight;
  }
}
