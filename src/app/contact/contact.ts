import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import emailjs from 'emailjs-com';  

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],  
})
export class ContactComponent {

  sendEmail() {
    const email = (document.getElementById('EmailInput') as HTMLInputElement).value;
    const message = (document.getElementById('MgsInput') as HTMLTextAreaElement).value;

    const templateParams = {
      from_email: email,
      message: message
    };

    emailjs.send('service_5i3cmp2', 'template_2wbczxg', templateParams, '-C4lToSNGqK1NK3A-')
      .then(() => {
        alert('Message sent!');
      }, (error) => {
        console.error(error);
        alert('Failed to send message');
      });
  }

}