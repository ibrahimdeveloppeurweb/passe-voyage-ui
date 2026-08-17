import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeModeService } from './core/services/theme-mode.service';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'demo1';

  constructor(private themeModeService: ThemeModeService) {}

}
