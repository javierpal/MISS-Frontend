import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { APP_ENVIRONMENT } from '../../core/config/environment.token';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatDividerModule],
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
                    <h2>Login placeholder</h2>
                    <p>Flujo de autenticación pendiente para próximos tickets.</p>
                    <div class="d-flex flex-column flex-sm-row gap-3 mt-3">
                      <a mat-raised-button color="primary" routerLink="/app/dashboard">Entrar al panel</a>
                      <button mat-stroked-button type="button">Configurar acceso</button>
                    </div>
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {
  protected readonly env = inject(APP_ENVIRONMENT);
}
