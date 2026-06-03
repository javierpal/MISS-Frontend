import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { authInterceptor } from './api/auth.interceptor';
import { errorInterceptor } from './api/error.interceptor';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ],
  exports: [],
})
export class CoreModule {}
