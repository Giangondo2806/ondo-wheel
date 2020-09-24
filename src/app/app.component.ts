import { Component, OnInit } from '@angular/core';
import { OndoWheelOption } from './owheel/lib/options/owheel.option';
import { OndoWheel } from './owheel/lib/owheel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  theWheel;
  wheelPower = 0;
  wheelSpinning = false;
  ngOnInit(): void {
    const option: OndoWheelOption = {
      numSegments: 8,
      outerRadius: 200,
      drawText: true,
      textFontSize: 16,
      textOrientation: 'curved',
      textAlignment: 'inner',
      textMargin: 90,
      textFontFamily: 'monospace',
      textStrokeStyle: 'black',
      textLineWidth: 3,
      textFillStyle: 'white',
      drawMode: 'segmentImage',
      pins: true,
      segments:
        [
          { image: 'assets/jane.png', text: 'Jane' },
          { image: 'assets/tom.png', text: 'Tom' },
          { image: 'assets/mary.png', text: 'Mary' },
          { image: 'assets/alex.png', text: 'Alex' },
          { image: 'assets/sarah.png', text: 'Sarah' },
          { image: 'assets/bruce.png', text: 'Bruce' },
          { image: 'assets/rose.png', text: 'Rose' },
          { image: 'assets/steve.png', text: 'Steve' }
        ],
      animation:
      {
        type: 'spinToStop',
        duration: 5,
        spins: 8,
        callbackFinished: 'console.log(this._targets[0].getIndicatedSegment())'
      }
    };
    this.theWheel = new OndoWheel(option, null);
    this.theWheel.startAnimation();
  }

  powerSelected(powerLevel) {
    if (this.wheelSpinning === false) {
      document.getElementById('pw1').className = '';
      document.getElementById('pw2').className = '';
      document.getElementById('pw3').className = '';
      if (powerLevel >= 1) {
        document.getElementById('pw1').className = 'pw1';
      }
      if (powerLevel >= 2) {
        document.getElementById('pw2').className = 'pw2';
      }
      if (powerLevel >= 3) {
        document.getElementById('pw3').className = 'pw3';
      }
      this.wheelPower = powerLevel;
      (document.getElementById('spin_button') as any).src = 'assets/spin_on.png';
      document.getElementById('spin_button').className = 'clickable';
    }
  }
  startSpin() {
    if (this.wheelSpinning === false) {
      if (this.wheelPower === 1) {
        this.theWheel.animation.spins = 3;
      }
      else if (this.wheelPower === 2) {
        this.theWheel.animation.spins = 8;
      }
      else if (this.wheelPower === 3) {
        this.theWheel.animation.spins = 15;
      }
      document.getElementById('spin_button').className = '';
      this.theWheel.startAnimation();
      this.wheelSpinning = true;
    }
  }
  resetWheel(): boolean {
    this.theWheel.stopAnimation(false);
    this.theWheel.rotationAngle = 0;
    this.theWheel.draw();
    document.getElementById('pw1').className = '';
    document.getElementById('pw2').className = '';
    document.getElementById('pw3').className = '';
    this.wheelSpinning = false;
    return false;
  }
  alertPrize() {
    const winningSegment = this.theWheel.getIndicatedSegment();
    alert(winningSegment.text + ' says Hi');
  }
}
