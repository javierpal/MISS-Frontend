import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { APP_ENVIRONMENT } from '../../core/config/environment.token';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <main class="page-shell login-page d-flex align-items-center">
      <div class="container-fluid py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-10 col-xl-8">
            <mat-card class="content-card overflow-hidden">
              <mat-card-content class="p-0">
                <div class="row g-0">
                  <div class="col-12 col-md-6 hero-panel p-4 p-md-5">
                    <span class="eyebrow">MISS Internal</span>
                    <h1>Frontend base listo para crecer</h1>
                    <p>Angular standalone + Material + Bootstrap utilities + routing base para el panel interno.</p>
                    <div class="api-box mt-4">
                      <strong>API base URL</strong>
                      <span>{{ env.apiBaseUrl }}</span>
                    </div>
                  </div>
                  <div class="col-12 col-md-6 form-panel p-4 p-md-5 d-flex flex-column justify-content-center">
                    <h2>Iniciar sesión</h2>
                    <p>Ingresa tus credenciales para acceder al panel.</p>

                    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-3">
                      <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Correo electrónico</mat-label>
                        <input matInput formControlName="email" type="email" placeholder="usuario@miss.local" />
                        @if (email?.invalid && email?.touched) {
                          <mat-error>{{ getErrorMessage('email') }}</mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-100">
                        <mat-label>Contraseña</mat-label>
                        <input matInput formControlName="password" type="password" placeholder="••••••••" />
                        @if (password?.invalid && password?.touched) {
                          <mat-error>{{ getErrorMessage('password') }}</mat-error>
                        }
                      </mat-form-field>

                      @if (errorMessage) {
                        <div class="alert alert-danger mt-3" role="alert">
                          {{ errorMessage }}
                        </div>
                      }

                      <button
                        mat-raised-button
                        color="primary"
                        type="submit"
                        class="w-100 mt-3 login-submit"
                        [disabled]="loading"
                      >
                        @if (loading) {
                          <mat-spinner diameter="20"></mat-spinner>
                        } @else {
                          Entrar al panel
                        }
                      </button>
                    </form>

                    <mat-divider class="my-4" />
                    <small>Base visual disponible para conectar auth real.</small>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .login-page { background: linear-gradient(180deg, rgba(30, 136, 229, 0.08), transparent 30%), var(--miss-bg); }
    .hero-panel { background: linear-gradient(135deg, rgba(30, 136, 229, 0.18), rgba(108, 182, 255, 0.08)); }
    .eyebrow { display: inline-flex; margin-bottom: 1rem; color: var(--miss-primary); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 0 0 1rem; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.05; }
    h2 { margin: 0 0 .75rem; }
    p, small, span { color: var(--miss-text-muted); }
    .api-box { display: grid; gap: .35rem; padding: 1rem 1.25rem; border: 1px solid var(--miss-border); border-radius: 16px; background: rgba(255,255,255,.5); }
    .alert { padding: 0.75rem 1rem; border-radius: 8px; background: #fdecea; color: #c62828; font-size: 0.875rem; }
    mat-form-field { margin-bottom: 1rem; }
    .login-submit {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  protected readonly env = inject(APP_ENVIRONMENT);

  protected loading = false;
  protected errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) return 'Este campo es obligatorio.';
    if (control?.hasError('email')) return 'Correo electrónico inválido.';
    if (control?.hasError('minlength')) return 'Mínimo 6 caracteres.';
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    if (!email || !password) return;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/app/dashboard']);
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Error al iniciar sesión';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
