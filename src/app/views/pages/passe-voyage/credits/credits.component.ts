import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-credits',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.scss'
})
export class CreditsComponent {

}
