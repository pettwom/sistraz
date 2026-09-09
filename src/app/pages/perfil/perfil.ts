import { Component,inject  } from '@angular/core';
import { Router } from '@angular/router';
import { ImportsModule } from '../../imports';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FtcoAnimateDirective } from '../../shared/directive/ftco-animate.directive';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import Swal from 'sweetalert2';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-perfil',
  imports: [ImportsModule, ReactiveFormsModule, FtcoAnimateDirective],
  standalone:true,
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil {
  pass!: string;
  newpass!: string;
  formNueva: FormGroup;
  private messageService = inject(MessageService);
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.formNueva = this.fb.group({
      password: ['', Validators.required],
      new_password: ['', Validators.required]
    });
  }
  cambiarPassword() {
    console.log(this.pass, this.newpass)
    console.log(this.pass === this.newpass)
    if (this.pass === this.newpass) {
      Swal.fire({
        title: 'Exito',
        text: 'Se realizo correctamente el cambio',
        icon: 'success',
        showConfirmButton: false,
        showCancelButton: false,
        timer: 2000
      })
    } else {      
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Las Contraseñas no coinciden! \n Revise por favor' });
    }
  }
}
