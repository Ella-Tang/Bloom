class Flower {
  constructor({x, y}, layer, dna) {
    this.x = x;
    this.y = y;
    this.layer = layer;
    this.dna = dna;
    this.initProperties();
    this.initActions();
    this.noiseOffset = random(1000);
  }

  initActions() {
    this.isBlooming = true; 
    this.bloomProgress = 0; 
    this.maxBloomSize = 1;
    this.isLeaving = false;
    this.verticalSpeed = -1; 
    this.windForce = random(-0.5, 0.5);
    this.windChangeFrequency = 0.1;
    this.windMagnitude = 2;
    this.windDirectionChange = 0.05;
    this.fadeProgress = 1;
  }
  
  initProperties() {
    this.fColor = this.getColor(); 
    this.diameter = map(this.dna.genes[5], 0, 1, windowWidth / 15, windowWidth / 20);
    this.pLength = map(this.dna.genes[6], 0, 1, 0.6, 1);
    this.pNum = Math.floor(map(this.dna.genes[7], 0, 1, 7, 11));
    this.spaceAng = map(this.dna.genes[8], 0, 1, 0.05, 0.1);
    this.waveAmp = map(this.dna.genes[9], 0, 1, 1, 1.5);
    this.waveNum = Math.floor(map(this.dna.genes[10], 0, 1, 2, 5)); 
    this.pBase = map(this.dna.genes[11], 0, 1, 0.1, 0.5);
    this.bpVisible = this.pNum > 8 && map(this.dna.genes[12], 0, 1, 0, 1) > 0.5;
    if (this.bpVisible) this.setupBp();
    this.centerR = map(this.dna.genes[18], 0, 1, 0.8, 1.1); 
    this.setupUnexpected();
    this.setupCurves();
    this.setupPollens();
  }
    
  getColor() {
    let baseColor = COLOR_PALETTE[Math.floor(map(this.dna.genes[0], 0, 1, 0, COLOR_PALETTE.length - 1))];
    let r = constrain(baseColor.r + parseInt(map(this.dna.genes[1], 0, 1, -20, 20)), 0, 255);
    let g = constrain(baseColor.g + parseInt(map(this.dna.genes[2], 0, 1, -20, 20)), 0, 255);
    let b = constrain(baseColor.b + parseInt(map(this.dna.genes[3], 0, 1, -20, 20)), 0, 255);
    let a = constrain(baseColor.a + parseInt(map(this.dna.genes[4], 0, 1, -20, 20)), 190, 250);
    return color(r, g, b, a);
  }
  
  setupBp() {
    this.bpScale = map(this.dna.genes[13], 0, 1, 1.1, 1.3);
    this.bpDiameter = this.diameter * this.bpScale;
    this.bpRotation = map(this.dna.genes[14], 0, 1, 0, PI / this.pNum) + 5 * (Math.PI / 180);
    this.bpWaveAmp = map(this.dna.genes[15], 0, 1, 1, 3);
    this.bpLength = this.pLength + map(this.dna.genes[16], 0, 1, 0.1, 0.3);
    this.bpBase = map(this.dna.genes[17], 0, 1, 0.05, 0.5);
  }
  
  setupUnexpected() {
    this.unexpectedPetals = [];
    for (let i = 0; i < this.pNum; i++) {
      let random = Math.random();
      if (random > 0.8) {
        this.unexpectedPetals.push(2);  //petal folded
      } else if (random > 0.6) {
        this.unexpectedPetals.push(1);  //petal cut off
      } else {
        this.unexpectedPetals.push(0);  //nothing happened
      }
    }
  }
  
  setupCurves() {
    this.curvePositions = [];
    for (let i = 0; i < this.pNum; i++) {
      const numCurves = Math.floor(random(2, 5));
      const curves = [];
      for (let j = 0; j < numCurves; j++) {
        const angleOffset = random(0.1, 0.6);
        const angle = TWO_PI / this.pNum * i + angleOffset * (TWO_PI / this.pNum);
        const len = random(0.7, 1) * this.diameter * this.pLength;
        curves.push({ angle, length: len });
      }
      this.curvePositions.push(curves);
    }
  }

  setupPollens() {
    this.pollenNum = Math.floor(random(10, 15));
    this.pollenPositions = [];
    const sz = this.diameter * 0.05;
    for (let i = 0; i < this.pollenNum; i++) {
      const angle = random(TWO_PI);
      const radius = random(this.diameter * 0.1, this.diameter * 0.2);
      const x = radius * cos(angle);
      const y = radius * sin(angle);
      this.pollenPositions.push({ x, y, sz });
    }
  }
  
  startLeaving() { 
    this.isLeaving = true; 
  }
  
  isOffScreen() { return this.y < 50 || this.y > windowHeight || this.x < 0 || this.x > windowWidth; }

  updatePosition() {
    this.updateWind();
    if (this.isLeaving) {
      this.verticalSpeed += this.windForce * 0.05;
      this.y += this.verticalSpeed;
      this.x += this.windForce;
    }
  }
  
  updateWind() {
    if (random(1) < this.windChangeFrequency) {
      this.windForce += random(-0.5, 0.5);
      this.windForce = constrain(this.windForce, -this.windMagnitude, this.windMagnitude);
      if (random(1) < this.windDirectionChange)  this.windForce *= -1;
    }
  }

  updateBloom() {
    this.bloomProgress += randomGaussian(0.02, 0.01)
    this.bloomProgress = Math.min(this.bloomProgress, 1);
    if (this.bloomProgress >= 1)  this.isBlooming = false;
  }

  updateFading() {
    this.fadeProgress -= randomGaussian(0.02, 0.01)
    this.fadeProgress = Math.max(this.fadeProgress, 0);
  }
  
  drawFlower() {
    this.updatePosition();
    if (this.isBlooming) this.updateBloom();
    if (this.isLeaving) this.updateFading();
    //update dimension based on blooming/fading progress
    let currDiameter = lerp(this.diameter / 2, this.diameter, this.bloomProgress);
    let currPLength = lerp(this.pLength / 2, this.pLength, this.bloomProgress);
    let currBpDiameter = lerp(this.diameter / 2 * this.bpScale, this.bpDiameter, this.bloomProgress);
    let currBpLength = lerp(this.pLength / 2 * this.bpScale, this.bpLength, this.bloomProgress);
    this.layer.push();
    this.layer.translate(this.x, this.y);
    //back petals & outline
    if (this.bpVisible && this.bloomProgress > 0.22) {
      this.layer.fill(255, this.bloomProgress * 255);
      this.drawPetals(currBpDiameter, this.bpRotation, this.bpWaveAmp, currBpLength, this.bpBase, false, false);
      this.drawOutline(currBpDiameter, this.bpRotation, this.bpWaveAmp, currBpLength, this.bpBase);
    }
    //front petals & outline
    if (this.bloomProgress > 0.25) {
      this.drawPetals(currDiameter, 0, this.waveAmp, currPLength, this.pBase, false, true);
      if (!this.bpVisible) this.drawOutline(currDiameter, 0.01, this.waveAmp, currPLength, this.pBase);
      for (let i = 0; i < this.pNum; i++) { this.drawPetalCurves(i); }
    }
    //update alpha based on blooming/fading progress
    let updatedA = this.getUpdatedAlpha(false);    
    //flower center
    if (this.bloomProgress > 0.2) this.drawCenter(currDiameter);
    //pollens
    if (this.bloomProgress > 0.5)  this.drawPollens(updatedA);
    this.layer.pop();
  }
  
  stylizePetal(isOutline, isFrontPetal) {
    let currA = this.getUpdatedAlpha(isFrontPetal);
    if (isOutline) { 
      this.layer.noFill();
    } else { 
      this.layer.fill(red(this.fColor), green(this.fColor), blue(this.fColor), currA); 
    }   
    this.layer.strokeWeight(2);
    this.layer.stroke(0, 0, 0, currA);
  }
  
  getUpdatedAlpha(isFrontPetal) {
    let baseA = this.bpVisible && isFrontPetal ? 255 : this.fColor._getAlpha();
    let currA = constrain(baseA *= (this.isLeaving ? this.fadeProgress : this.bloomProgress), 0, baseA);
    return currA;
  }
  
  drawPollens(updatedA) {
    this.layer.fill(0, 0, 0, updatedA);
    this.layer.noStroke();
    for (let i = 0; i < this.pollenNum; i++) {
      let pollen = this.pollenPositions[i];
      this.layer.ellipse(pollen.x, pollen.y, pollen.sz, pollen.sz);
    }
  }
  
  drawCenter(currDiameter) {
    let updatedA = this.getUpdatedAlpha(true);
    let currCenter = lerp(0.3, 1, this.bloomProgress);
    let baseR = currDiameter * this.centerR * 0.2;
    this.layer.beginShape();
    for (let ang = 0; ang < TWO_PI; ang += 0.1) {
      let r = baseR * currCenter * (0.7 * noise(this.noiseOffset + ang * 5) + 1);
      let x = r * cos(ang);
      let y = r * sin(ang);
      this.layer.vertex(x, y);
    }
    this.layer.fill(240, 234, 214, updatedA);
    this.layer.endShape(CLOSE);
  }  
  
  drawOutline(diameter, rotation, waveAmp, length, base) {
    let outlineSz = diameter * 1.06;
    this.drawPetals(outlineSz, rotation, waveAmp * 1.02, length * 1.03, base, true, false);
  }

  drawPetals(diameter, rotOffset, waveAmp, length, base, isOutline, isFrontPetal) {
    let currR = diameter * this.centerR * 0.2;  
    for (let i = 0; i < this.pNum; i++) {
      let angle = TWO_PI / this.pNum * i + rotOffset;
      let nextAngle = TWO_PI / this.pNum * (i + 1) + rotOffset;
      let baseInnerR = currR;
      let unexpected = this.unexpectedPetals[i];  //if petal cut/ fold
      let outerR = this.getPetalOuterR(diameter, length, unexpected, i, this.noiseOffset);
      let start = p5.Vector.fromAngle(angle + this.spaceAng, currR );
      let end = p5.Vector.fromAngle(nextAngle - this.spaceAng, currR );
      
      this.layer.beginShape();
      this.stylizePetal(isOutline); 
      this.layer.vertex(start.x, start.y);
      this.pSideCurve(start, end, baseInnerR, i);
      this.pTopCurve(angle, nextAngle, this.spaceAng, outerR, unexpected, waveAmp, i);
      this.layer.vertex(end.x, end.y);
      this.layer.endShape(CLOSE);
    }
  }
  
  drawPetalCurves(petal) {
    if (this.bloomProgress > 0.5) {
      const curves = this.curvePositions[petal];
      for (let i = 0; i < curves.length; i++) {
        let curve = curves[i];
        let currLength = curve.length * (this.bloomProgress - 0.5) * 2;
        this.drawCurveLine(curve.angle, currLength);
      }
    }
  }
  
  drawCurveLine(angle, length) {
    let start = p5.Vector.fromAngle(angle, length * 0.3);
    let p1 = p5.Vector.fromAngle(angle + 0.1, length * 0.5);
    let p2 = p5.Vector.fromAngle(angle + 0.2, length * 0.6);
    let end = p5.Vector.fromAngle(angle + 0.3, length * 0.8);

    this.layer.push();
    this.layer.stroke(0);
    this.layer.strokeWeight(2);
    this.layer.noFill();
    this.layer.pop();
    
    this.layer.beginShape();
    this.layer.vertex(start.x, start.y);
    this.layer.bezierVertex(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
    this.layer.endShape();
  }
  
  pSideCurve(start, end, radius, index) {
    let midAng = (start.heading() + end.heading()) / 2;
    let midR = radius + noise(this.noiseOffset + index * 0.2) * 5;
    let midPoint = p5.Vector.fromAngle(midAng, midR);
    this.layer.quadraticVertex(midPoint.x, midPoint.y, end.x, end.y);
  }
  
  pTopCurve(angle, nextAngle, spaceAng, outerR, unexpected, waveAmp, petalIndex) {
    let waveLen = (nextAngle - angle - 2 * this.spaceAng) / this.waveNum;
    let waveInvert = (unexpected === 2) ? -1 : 1; 
    
    for (let j = 0; j <= this.waveNum; j++) {
      let waveAng = angle + spaceAng + j * waveLen;
      let baseWaveHeight = outerR + waveInvert * sin(waveAng * 10) * waveAmp;
      let noiseEffect = noise(this.noiseOffset + petalIndex * 0.1 + j) * 5; 
      let waveH = baseWaveHeight + noiseEffect;
      let wavePoint = p5.Vector.fromAngle(waveAng, waveH);
      this.layer.curveVertex(wavePoint.x, wavePoint.y);
    }
    let startNoise = noise(this.noiseOffset + petalIndex * 0.1 + angle) * 5;
    let endNoise = noise(this.noiseOffset + petalIndex * 0.1 + nextAngle) * 5;
    let start = p5.Vector.fromAngle(angle + this.spaceAng, outerR + startNoise);
    let end = p5.Vector.fromAngle(nextAngle - this.spaceAng, outerR + endNoise);
    this.layer.vertex(start.x, start.y);
    this.layer.vertex(end.x, end.y);
  }
  
  getPetalOuterR(diameter, length, unexpected, index, noiseOffset) {
    if (unexpected == 1) { //petal cut off
      return diameter * length * 0.9;
    } else if (unexpected == 2) { //petal folded
      return diameter * length + noise(noiseOffset + index * 0.3) * 20;
    }
    return diameter * length; //regular petal
  }
}
