import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import chroma from 'chroma-js';

@Component({
  selector: 'app-waves',
  standalone: true,
  templateUrl: './waves.html',
  styleUrls: ['./waves.css']
  
})
export class WavesComponent implements AfterViewInit {

  @ViewChild('svg', { static: false }) svgRef?: ElementRef<SVGElement>;

  svg!: SVGElement;

  winW = window.innerWidth;
  winH = window.innerHeight;

  Colors: string[] = [];
  Paths: Path[] = [];
  overflow!: number;
  time = 0;
  settings: any;

    animate() {

  this.time += 0.005;

  this.Paths.forEach((path) => {

    path.settings = this.settings;
    path.time = this.time;

    path.root = [];
    path.createRoot();
    path.updatePath();

  });

  requestAnimationFrame(() => this.animate());

}
  /* TOP SETTINGS */
  topSettings = {
    amplitudeX: 300,
    amplitudeY: 100,
    lines: 40,
    smoothness: 3,
    offsetX: -13,

    hueStartColor: 182,
    saturationStartColor: 100,
    lightnessStartColor: 69,

    hueEndColor: 261,
    saturationEndColor: 100,
    lightnessEndColor: 59,

    fill: false,
    crazyness: 0.01,
    strokeWidth: 1
  };

  /* BOTTOM SETTINGS */
  bottomSettings = {
    amplitudeX: 300,
    amplitudeY: 36,
    lines: 40,
    smoothness: 2.6,
    offsetX: 20,

    hueStartColor: 218,
    saturationStartColor: 100,
    lightnessStartColor: 52,

    hueEndColor: 350,
    saturationEndColor: 100,
    lightnessEndColor: 62,

    fill: false,
    crazyness: 0.03,
    strokeWidth: 3
  };

  /* INTERPOLATION */
  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  getInterpolatedSettings(t: number) {

    const result: any = {};

    Object.keys(this.topSettings).forEach((key) => {

      const a = (this.topSettings as any)[key];
      const b = (this.bottomSettings as any)[key];

      if (typeof a === 'number') {
        result[key] = this.lerp(a, b, t);
      } else {
        result[key] = t > 0.5 ? b : a;
      }

    });

    return result;
  }

  ngAfterViewInit() {

    if (!this.svgRef) {
      console.error("SVG not found");
      return;
    }

    this.svg = this.svgRef.nativeElement;

    this.settings = this.topSettings;

    this.buildPaths();

    let ticking = false;

    window.addEventListener('scroll', () => {

      if (!ticking) {

        requestAnimationFrame(() => {

          const scrollTop = window.scrollY;
          const maxScroll = document.body.scrollHeight - window.innerHeight;

          const progress = Math.min(scrollTop / maxScroll, 1);

          this.settings = this.getInterpolatedSettings(progress);

          this.updatePaths();

          ticking = false;

        });

        ticking = true;

      }
     
    });

    window.addEventListener('resize', () => {

      this.winW = window.innerWidth;
      this.winH = window.innerHeight;

      this.svg.innerHTML = '';
      this.buildPaths();

    });
 this.animate();
  }

  buildPaths() {

    this.overflow = Math.abs(this.settings.lines * this.settings.offsetX);

    const startColor =
      `hsl(${this.settings.hueStartColor}, ${this.settings.saturationStartColor}%, ${this.settings.lightnessStartColor}%)`;

    const endColor =
      `hsl(${this.settings.hueEndColor}, ${this.settings.saturationEndColor}%, ${this.settings.lightnessEndColor}%)`;

    this.Colors = chroma
      .scale([startColor, endColor])
      .mode('lch')
      .colors(Math.round(this.settings.lines) + 2);

    this.Paths = [];

    for (let i = 0; i < Math.round(this.settings.lines) + 1; i++) {

      const rootY = this.winH / this.settings.lines * i;

      const path = new Path(
        rootY,
        this.Colors[i + 1],
        this.settings.offsetX * i,
        this.settings,
        this.winW,
        this.winH,
        this.overflow,
        this.svg
      );

      this.Paths.push(path);

      path.createRoot();
      path.createPath();

    }

  }

updatePaths() {

  const startColor =
    `hsl(${this.settings.hueStartColor}, ${this.settings.saturationStartColor}%, ${this.settings.lightnessStartColor}%)`;

  const endColor =
    `hsl(${this.settings.hueEndColor}, ${this.settings.saturationEndColor}%, ${this.settings.lightnessEndColor}%)`;

  this.Colors = chroma
    .scale([startColor, endColor])
    .mode('lch')
    .colors(Math.round(this.settings.lines) + 2);

  this.Paths.forEach((path, i) => {

    path.settings = this.settings;
    path.fill = this.Colors[i + 1];

    path.path.setAttribute('stroke', path.fill);
    path.path.setAttribute('stroke-width', this.settings.strokeWidth);
    

    path.root = [];

    path.createRoot();
    path.updatePath();

  });

}

}

/* PATH CLASS */

class Path {

  root: any[] = [];
  path!: SVGPathElement;
  time = 0;

  constructor(
    public rootY: number,
    public fill: string,
    public offsetX: number,
    public settings: any,
    public winW: number,
    public winH: number,
    public overflow: number,
    public svg: SVGElement
  ) {}

  createRoot() {

    let x = -this.overflow + this.offsetX;
    let rootY = this.rootY;

    this.root.push({ x, y: rootY });

    while (x < this.winW) {

      x += this.settings.amplitudeX;

      let value = Math.sin(x * this.settings.crazyness + this.time) 

      let y = this.settings.amplitudeY * value + rootY;

      this.root.push({ x, y });

    }

    this.root.push({ x: this.winW + this.overflow, y: rootY });

  }

  createPath() {

    this.path = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );

    this.path.setAttribute('fill', this.settings.fill ? this.fill : 'none');
    this.path.setAttribute('stroke', this.fill);
    this.path.setAttribute('stroke-width', this.settings.strokeWidth);
    this.path.setAttribute('stroke-linecap', 'round');
    this.path.setAttribute('stroke-linejoin', 'round'); 

    this.updatePath();

    this.svg.appendChild(this.path);

  }

  updatePath() {

    let d = `M -${this.overflow} ${this.winH + this.overflow}`;
    d += ` L ${this.root[0].x} ${this.root[0].y}`;

    for (let i = 1; i < this.root.length - 1; i++) {

      let prev = this.root[i - 1];
      let curr = this.root[i];

      let diffX = (curr.x - prev.x) / this.settings.smoothness;

      let x1 = prev.x + diffX;
      let x2 = curr.x - diffX;

      d += `C ${x1} ${prev.y}, ${x2} ${curr.y}, ${curr.x} ${curr.y}`;

    }

    d += ` L ${this.winW + this.overflow} ${this.winH + this.overflow}`;
    d += ` Z`;

    this.path.setAttribute('d', d);

  }

}