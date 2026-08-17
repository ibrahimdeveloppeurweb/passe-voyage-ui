import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ThemeModeService } from '../../../core/services/theme-mode.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserSession } from '../../../core/models/user-session.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgbDropdownModule,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  currentTheme: string;
  currentUser: UserSession | null = null;

  constructor(
    private router: Router, 
    private themeModeService: ThemeModeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getDataToken();
    this.themeModeService.currentTheme.subscribe( (theme) => {
      this.currentTheme = theme;
      this.showActiveTheme(this.currentTheme);
    });
  }

  showActiveTheme(theme: string) {
    const themeSwitcher = document.querySelector('#theme-switcher') as HTMLInputElement;
    const box = document.querySelector('.box') as HTMLElement;

    if (!themeSwitcher) {
      return;
    }

    // Toggle the custom checkbox based on the theme
    if (theme === 'dark') {
      themeSwitcher.checked = true;
      box.classList.remove('light');
      box.classList.add('dark');
    } else if (theme === 'light') {
      themeSwitcher.checked = false;
      box.classList.remove('dark');
      box.classList.add('light');
    }
  }

  /**
   * Change the theme on #theme-switcher checkbox changes 
   */
  onThemeCheckboxChange(e: Event) {
    const checkbox = e.target as HTMLInputElement;
    const newTheme: string = checkbox.checked ? 'dark' : 'light';
    this.themeModeService.toggleTheme(newTheme);
    this.showActiveTheme(newTheme);
  }

  /**
   * Toggle the sidebar when the hamburger button is clicked
   */
  toggleSidebar(e: Event) {
    e.preventDefault();
    document.body.classList.add('sidebar-open');
    document.querySelector('.sidebar .sidebar-toggler')?.classList.add('active');
  }

  /**
   * Logout
   */
  onLogout(e: Event) {
    e.preventDefault();
    this.authService.logout();
  }

  get userName(): string {
    if (!this.currentUser) return 'Utilisateur';
    return `${this.currentUser.firstname ?? ''} ${this.currentUser.nom ?? ''}`.trim() || 'Utilisateur';
  }

  get userEmail(): string {
    return this.currentUser?.email ?? '';
  }

  get userPhoto(): string {
    return this.currentUser?.photo ?? 'https://placehold.co/80x80';
  }

  get userPhotoSmall(): string {
    return this.currentUser?.photo ?? 'https://placehold.co/30x30';
  }

}
