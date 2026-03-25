import { Component, signal, AfterViewInit, HostListener, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { HeroComponent } from './hero/hero';
import { SkillsComponent } from './skills/skills';
import { ProjectsComponent } from './projects/projects';
import { ContactComponent } from './contact/contact';
import { WavesComponent } from './waves/waves';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent, SkillsComponent, ProjectsComponent, ContactComponent, WavesComponent,],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  
})



export class App implements AfterViewInit {

  protected readonly title = signal('NathanPortfolio');
  dragging = false;

  @ViewChild('pupilLeft') pupilLeft!: ElementRef<SVGCircleElement>;
  @ViewChild('pupilRight') pupilRight!: ElementRef<SVGCircleElement>;
  @ViewChild('faceSVG') face!: ElementRef<SVGSVGElement>;

  
  idleTimer: any;
  eyesOpen = false;
  hovering = false;
  lastVelocity = 0;
  isOpen = false;

  //Scroll


  //Dragging
startDrag(event: MouseEvent) {
  event.preventDefault();
  this.dragging = true;
  this.showOpenEyes();
  document.body.classList.add('dragging');
  const lottie = document.getElementById("water") as any;
  if (lottie) {
    lottie.setAttribute("speed", "2");
  }
  }

@HostListener('document:mouseup')
stopDrag() {
  this.dragging = false;
  this.startMomentumScroll();
  document.body.classList.remove('dragging');
  const blob = document.getElementById("blob");
  if (blob) {
    blob.classList.add("release");
    const overshoot = Math.max(Math.min(this.lastVelocity * 2, 30), -30);
    blob.style.transform = `translateY(${overshoot}px)`;
    setTimeout(() => {
      blob.style.transform = `translateY(0px)`;
    }, 50);
    setTimeout(() => {
      blob.classList.remove("release");
    }, 400);
  }
  const lottie = document.getElementById("water") as any;
  if (lottie) {
    lottie.setAttribute("speed", "1");
  }
  if (!this.hovering) {
    this.showClosedEyes();
  }
}

startMomentumScroll() {
  cancelAnimationFrame(this.momentumFrame);
  const decay = 0.75; 
  const minVelocity = 0.2;
  const step = () => {
    window.scrollBy(0, this.momentum);
    this.momentum *= decay;
    if (Math.abs(this.momentum) < minVelocity) {
      this.momentum = 0;
      return;
    }
    this.momentumFrame = requestAnimationFrame(step);
  };
  this.momentumFrame = requestAnimationFrame(step);
}

momentum = 0;
momentumFrame: any = null;

@HostListener('document:mousemove', ['$event'])
onMouseMove(event: MouseEvent) {
  if (!this.dragging) return;
  this.lastVelocity = this.lastVelocity * 0.7 + event.movementY * 0.3;
  this.momentum = this.lastVelocity * 5;
  const scrollAmount = event.movementY * 5;
  window.scrollBy(0, scrollAmount);
  const blob = document.getElementById("blob");
  if (this.hovering || this.dragging) {
    this.moveEyes(event);
  }
  if (blob) {
    const stretch = Math.min(Math.abs(event.movementY) / 20, 0.4);
    const direction = event.movementY > 0 ? 1 : -1;
    blob.style.transform =
      `scaleY(${1 + stretch}) scaleX(${1 - stretch}) skewY(${direction * 8}deg)`;
  }
}
    //Eyes tracking
      hoverStart() {
  this.hovering = true;
  this.showOpenEyes();
}

hoverEnd() {
  this.hovering = false;
  if (!this.dragging) {
    this.showClosedEyes();
  }
}

showOpenEyes() {
  const open = document.getElementById("openEyes");
  const closed = document.getElementById("closedEyes");
  if (open && closed) {
    open.style.display = "block";
    closed.style.display = "none";
  }
}
showClosedEyes() {
  const open = document.getElementById("openEyes");
  const closed = document.getElementById("closedEyes");
  if (open && closed) {
    open.style.display = "none";
    closed.style.display = "block";
  }
}
  moveEyes(event: MouseEvent) {

    if (!this.face) return;
    const rect = this.face.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const angle = Math.atan2(dy, dx);
    const maxMove = 2.5;
    const moveX = Math.cos(angle) * maxMove;
    const moveY = Math.sin(angle) * maxMove;
    this.pupilLeft.nativeElement.setAttribute(
      "transform",
      `translate(${moveX},${moveY})`
    );
    this.pupilRight.nativeElement.setAttribute(
      "transform",
      `translate(${moveX},${moveY})`
    );
  }
//--------------------------------------------
  //Scroll behaviour
scroll(id: string) {
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 0);
}

//--------------------------------------------


  //Sections fade in
  ngAfterViewInit(): void {
    const sections = Array.from(document.querySelectorAll('.zoom-section'));
    const open = document.getElementById("openEyes");
    if (open) open.style.display = "none";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = sections.indexOf(entry.target as Element);
          sections.forEach((section, i) => {
            section.classList.remove('active', 'wasactive');
            if (i < index) section.classList.add('wasactive');
            if (i === index) section.classList.add('active');
          });

          const label = document.getElementById("sectionLabel");
          const names: { [key: string]: string } = {
            hero: "Home",
            skills: "Skills",
            projects: "Projects",
            contact: "Contact"
          };
          if (label) {
            const id = (entry.target as HTMLElement).id;
            label.textContent = names[id] ?? id;
          }       

        }
      });
    }, { threshold: 0.1 });
    sections.forEach(section => observer.observe(section));
  }
}
