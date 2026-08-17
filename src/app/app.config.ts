import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { handlerErrorInterceptor } from './core/interceptors/handler-error.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxSpinnerModule } from 'ngx-spinner';
import { provideHighlightOptions } from 'ngx-highlightjs';

const highlightOptions = {
  coreLibraryLoader: () => import('highlight.js/lib/core'),
  languages: {
    typescript: () => import('highlight.js/lib/languages/typescript'),
    scss: () => import('highlight.js/lib/languages/scss'),
    xml: () => import('highlight.js/lib/languages/xml')
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })), 
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([
      jwtInterceptor,
      handlerErrorInterceptor,
      loaderInterceptor
    ])),
    importProvidersFrom([
      SweetAlert2Module.forRoot(),
      NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })
    ]),
    provideHighlightOptions(highlightOptions), // ngx-highlightjs: https://github.com/murhafsousli/ngx-highlightjs
  ],
};
