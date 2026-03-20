import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class SkillsComponent {
      //Fade in skill groups
    ngAfterViewInit(): void {

      const skillsSection = document.querySelector('.container');

      const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('skills-visible');
          }
        });

      }, { threshold: 0.3 });

      if(skillsSection){
        observer.observe(skillsSection);
      }

    }
}
