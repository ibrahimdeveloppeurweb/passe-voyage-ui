import { NgClass, NgIf, NgStyle, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading = false;
  showPwd = false;
  returnUrl = '/passe-voyage';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/passe-voyage';

    // Redirect if already logged in
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.loginForm.controls; }

  togglePassword(): void {
    this.showPwd = !this.showPwd;
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        
        let target = this.returnUrl;
        
        // S'il s'agit de la racine par défaut
        if (target === '/passe-voyage' || target === '/') {
          const role = (this.auth.getRole() || '').toLowerCase();
          const perms = this.auth.getPermissions() || [];
          
          const isCompagnie = role.includes('compagnie') || role.includes('partenaire') || perms.includes('MENU_COMPAGNIE_DASHBOARD');
          const hasGrandDashboard = perms.includes('FULL_ACCESS') || perms.includes('MENU_DASHBOARD');

          if (isCompagnie && !hasGrandDashboard) {
            target = '/espace-compagnie/dashboard';
          }
        }

        this.router.navigate([target]);
      },
      error: () => {
        this.loading = false;
        // Errors are handled globally by HandlerErrorInterceptor
      }
    });
  }
}
