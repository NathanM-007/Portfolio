import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import chroma from 'chroma-js';

interface WaveSettings {
  amplitudeX: number;
  amplitudeY: number;
  lines: number;
  smoothness: number;
  offsetX: number;
  hueStartColor: number;
  saturationStartColor: number;
  lightnessStartColor: number;
  hueEndColor: number;
  saturationEndColor: number;
  lightnessEndColor: number;
  fill: boolean;
  crazyness: number;
  strokeWidth: number;
}

@Component({
  selector: 'app-waves',
  standalone: true,
  templateUrl: './waves.html',
  styleUrls: ['./waves.css']
})
export class WavesComponent implements AfterViewInit, OnDestroy {

  @ViewChild('svg', { static: false }) svgRef?: ElementRef<SVGElement>;

  svg!: SVGElement;

  winW = window.innerWidth;
  winH = window.innerHeight;

  Colors: string[] = [];
  Paths: Path[] = [];

  overflow = 0;
  time = 0;
  animationId!: number;

  settings!: WaveSettings;

  /* top wave */
  topSettings: WaveSettings = {
    amplitudeX: 270,
    amplitudeY: 65,
    lines: 25,
    smoothness: 2.6,
    offsetX: -13,
    hueStartColor: 182,
    saturationStartColor: 100,
    lightnessStartColor: 70,
    hueEndColor: 261,
    saturationEndColor: 100,
    lightnessEndColor: 60,
    fill: false,
    crazyness: 0.02,
    strokeWidth: 2
  };

  /* bottom wave */
  bottomSettings: WaveSettings = {
    amplitudeX: 270,
    amplitudeY: 65,
    lines: 25,
    smoothness: 2.6,
    offsetX: -10,
    hueStartColor: 198,
    saturationStartColor: 100,
    lightnessStartColor: 61,
    hueEndColor: 281,
    saturationEndColor: 100,
    lightnessEndColor: 64,
    fill: false,
    crazyness: 0.02,
    strokeWidth: 2
  };

  /* ---------- animation ---------- */

  animate() {
    this.time += 0.005;

    this.Paths.forEach((path) => {
      path.time = this.time;
      path.updatePath(); 
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
  }


  lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  getInterpolatedSettings(t: number): WaveSettings {
    const result: any = {};

    Object.keys(this.topSettings).forEach((key) => {
      const a = (this.topSettings as any)[key];
      const b = (this.bottomSettings as any)[key];

      result[key] = typeof a === 'number' ? this.lerp(a, b, t) : (t > 0.5 ? b : a);
    });

    return result;
  }


  ngAfterViewInit() {

    if (!this.svgRef) return;

    this.svg = this.svgRef.nativeElement;
    this.settings = this.topSettings;

    this.buildPaths();

    let ticking = false;

    window.addEventListener('scroll', () => {

      if (!ticking) {

        requestAnimationFrame(() => {

          const scrollTop = window.scrollY;
          const maxScroll = document.body.scrollHeight - window.innerHeight;

          const progress = maxScroll > 0
            ? Math.min(scrollTop / maxScroll, 1)
            : 0;

          this.settings = this.getInterpolatedSettings(progress);

          this.updateColorsOnly();

          ticking = false;

        });

        ticking = true;
      }
    });

    window.addEventListener('resize', () => {

      this.winW = window.innerWidth;
      this.winH = window.innerHeight;

      while (this.svg.firstChild) {
        this.svg.removeChild(this.svg.firstChild);
      }

      this.buildPaths();
    });

    this.animate();
  }


  buildPaths() {

    this.overflow = Math.abs(this.settings.lines * this.settings.offsetX);

    const startColor = `hsl(${this.settings.hueStartColor}, ${this.settings.saturationStartColor}%, ${this.settings.lightnessStartColor}%)`;
    const endColor = `hsl(${this.settings.hueEndColor}, ${this.settings.saturationEndColor}%, ${this.settings.lightnessEndColor}%)`;

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


  updateColorsOnly() {

    const startColor = `hsl(${this.settings.hueStartColor}, ${this.settings.saturationStartColor}%, ${this.settings.lightnessStartColor}%)`;
    const endColor = `hsl(${this.settings.hueEndColor}, ${this.settings.saturationEndColor}%, ${this.settings.lightnessEndColor}%)`;

    this.Colors = chroma
      .scale([startColor, endColor])
      .mode('lch')
      .colors(Math.round(this.settings.lines) + 2);

    this.Paths.forEach((path, i) => {
      path.settings = this.settings;
      path.fill = this.Colors[i + 1];

      path.path.setAttribute('stroke', path.fill);
      path.path.setAttribute('stroke-width', String(this.settings.strokeWidth)); 
    });
  }
}

/* ---------- PATH CLASS ---------- */

class Path {

  root: any[] = [];
  path!: SVGPathElement;
  time = 0;

  constructor(
    public rootY: number,
    public fill: string,
    public offsetX: number,
    public settings: WaveSettings,
    public winW: number,
    public winH: number,
    public overflow: number,
    public svg: SVGElement
  ) {}

  createRoot() {

    let x = -this.overflow + this.offsetX;

    this.root.push({ x, y: this.rootY });

    while (x < this.winW) {
      x += this.settings.amplitudeX;

      this.root.push({ x, y: this.rootY });
    }

    this.root.push({ x: this.winW + this.overflow, y: this.rootY });
  }

  createPath() {

    this.path = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );

    this.path.setAttribute('fill', this.settings.fill ? this.fill : 'none');
    this.path.setAttribute('stroke', this.fill);
    this.path.setAttribute('stroke-width', String(this.settings.strokeWidth));
    this.path.setAttribute('stroke-linecap', 'round');
    this.path.setAttribute('stroke-linejoin', 'round');

    this.svg.appendChild(this.path);

    this.updatePath();
  }

  updatePath() {

    let d = `M -${this.overflow} ${this.winH + this.overflow}`;
    d += ` L ${this.root[0].x} ${this.root[0].y}`;

    for (let i = 1; i < this.root.length - 1; i++) {

      const prev = this.root[i - 1];
      const curr = this.root[i];

      const y1 = prev.y + Math.sin(prev.x * this.settings.crazyness + this.time + this.offsetX * 0.01) * this.settings.amplitudeY;
      const y2 = curr.y + Math.sin(curr.x * this.settings.crazyness + this.time + this.offsetX * 0.01) * this.settings.amplitudeY;

      const diffX = (curr.x - prev.x) / this.settings.smoothness;

      const x1 = prev.x + diffX;
      const x2 = curr.x - diffX;

      d += `C ${x1} ${y1}, ${x2} ${y2}, ${curr.x} ${y2}`;
    }

    d += ` L ${this.winW + this.overflow} ${this.winH + this.overflow}`;
    d += ` Z`;

    this.path.setAttribute('d', d);
  }
}