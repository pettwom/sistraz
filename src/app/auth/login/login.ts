import { Component, SecurityContext } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ImportsModule } from '../../imports';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Router } from '@angular/router';
import { ServiceServices } from '../../services/service.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ImportsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  formLogin: FormGroup;
  captchaTexto = '';
  captchaSvg!: SafeHtml;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sanitizer: DomSanitizer,
    private services: ServiceServices
  ) {

    this.formLogin = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required],
      captcha: ['', Validators.required]
    });
    this.generarCaptcha();
  }

  ngOnInit() {
  }

  // VER PASSWORD 
  verPass() {
    const passwordInput = document.getElementById("password");
    const iconoEyes = document.getElementById("iconoEyes");
    const input = passwordInput?.getAttribute("type") ?? 'password';
    if (input === 'text') {
      passwordInput?.setAttribute("type", "password");
      iconoEyes?.classList.remove("pi-eye");
      iconoEyes?.classList.add("pi-eye-slash");
    } else {
      passwordInput?.setAttribute("type", "text");
      iconoEyes?.classList.remove("pi-eye-slash");
      iconoEyes?.classList.add("pi-eye");
    }
  }

  // CAPTCHA
  generarCaptcha(): void {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let texto = '';
    for (let i = 0; i < 5; i++) {
      const index = Math.floor(Math.random() * caracteres.length);
      texto += caracteres[index];
    }

    this.captchaTexto = texto;
    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="180"
        height="55"
        viewBox="0 0 180 55">

        <rect
          width="180"
          height="55"
          rx="6"
          fill="#0d1b2a"
        />

        <line
          x1="5"
          y1="10"
          x2="175"
          y2="40"
          stroke="#4f6b85"
          stroke-width="1.5"
        />

        <line
          x1="10"
          y1="45"
          x2="170"
          y2="12"
          stroke="#2f4f68"
          stroke-width="1"
        />

        <circle
          cx="25"
          cy="15"
          r="2"
          fill="#6fa8dc"
        />

        <circle
          cx="150"
          cy="35"
          r="2"
          fill="#9ccc65"
        />

        <text
          x="50%"
          y="52%"
          dominant-baseline="middle"
          text-anchor="middle"
          font-size="26"
          font-family="monospace"
          font-weight="bold"
          letter-spacing="6"
          fill="#ffffff">
          ${texto}
        </text>

      </svg>
    `;

    this.captchaSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
    this.formLogin.patchValue({ captcha: '' });
  }

  ingresar() {

    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const captchaIngresado = this.formLogin.value.captcha?.trim().toUpperCase();

    console.log(captchaIngresado, 'captcha');

    if (captchaIngresado !== this.captchaTexto && this.captchaTexto !== '') {
      Swal.fire({
        title: 'Error',
        icon: 'error',
        text: 'Captcha Incorrecto',
        showCancelButton: false,
        showConfirmButton: false,
        timer: 1500
      })
      this.generarCaptcha();
      return;
    }
    const usuario = this.formLogin.value.usuario?.trim();
    const password = this.formLogin.value.password;

    // temporalmente
    this.services.post('/Auth/login', { usuario, password }).subscribe({
      next: (resultado: any) => {
        localStorage.setItem('token', resultado.token)
        localStorage.setItem('usuario', JSON.stringify(resultado.usuario))
        this.router.navigate(['dashboard']);
      },
      error: (error) => {
        console.log(error);
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: error.error?.message ?? 'Usuario o contraseña incorrectos',
          showCancelButton: false,
          showConfirmButton: false,
          timer: 1500
        })
        this.generarCaptcha();
      }
    });



    this.router.navigate(['/dashboard']);

  }

}