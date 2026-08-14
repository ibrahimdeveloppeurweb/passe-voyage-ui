import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule
  ],
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.scss'
})
export class AdministrationComponent {

}
