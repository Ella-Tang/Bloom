class HandDetection {
  constructor() {
    this.video = createCapture(VIDEO);
    this.video.size(windowWidth, windowHeight);
    this.video.hide();

    this.handpose = ml5.handpose(this.video, () => { console.log("Handpose model ready!"); });
    this.predictions = [];
    this.handpose.on("predict", results => { this.predictions = results; });
  }
  
  show() {
    push();
    translate(windowWidth, 0);
    scale(-1, 1);
    image(this.video, 0, 0, windowWidth, windowHeight);
    pop();
  }
  
  getHandPosition() {
    if (this.predictions.length > 0) {
      let rawX = this.predictions[0].landmarks[8][0];
      let rawY = this.predictions[0].landmarks[8][1];
      let x = windowWidth - (rawX * 3);
      let y = rawY * 2.5;
      return {x, y};
    }
    return null;
  }
}
