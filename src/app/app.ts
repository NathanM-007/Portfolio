import { Component, signal } from '@angular/core';
import { HeroComponent } from './hero/hero';
import { SkillsComponent } from './skills/skills';
import { ProjectsComponent } from './projects/projects';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ HeroComponent, SkillsComponent, ProjectsComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})

export class App {
  protected readonly title = signal('NathanPortfolio');

  scrollTo(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }  

 
}
