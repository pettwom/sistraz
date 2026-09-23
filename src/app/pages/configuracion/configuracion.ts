import { Component, OnInit } from '@angular/core';
import { ImportsModule } from '../../imports';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';
import { CustomerService } from '../../services/customerservice';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ServiceServices } from '../../services/service.services';
// export interface Customer {
//   name?: string;
//   code?: string;
// }
export interface Representative {
  name?: string;
  image?: string;
}

export interface Country {
  name?: string;
  code?: string;
}

export interface Excel {
  id?: number;
  fecha?: string | Date;
  nro_cre?: string;
  nro_cre_fenix?: string;
  cliente?: string;
  planta_descarga?: string;
  conductor?: string;
  placa?: string;
  empresa_trans?: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css',
})
export class Configuracion implements OnInit {
  files: File[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;
  idPlanta: number = 0;
  excelList!: Excel[];
  selectedExcel!: Excel;
  err: any;


  constructor(
    private messageService: MessageService,
    private customerService: CustomerService,
    private service: ServiceServices

  ) { }

  ngOnInit() {
    // this.selectedExcel.getCustomersSmall().then((data) => (this.customers = data));

    this.actualizarTabla();
  }

  getSeverity(status: string) {
    switch (status) {
      case 'unqualified':
        return 'danger';

      case 'qualified':
        return 'success';

      case 'new':
        return 'info';

      case 'negotiation':
        return 'warn';

      case 'renewal':
        return null;
      default:
        return null;
    }
  }

  // ======================================================
  // CONFIGURACIÓN DE ARCHIVOS
  // ======================================================

  private readonly MAX_FILE_SIZE = 3.5 * 1024 * 1024; // 3.5 MB


  choose(event: Event, callback: () => void): void {
    callback();
  }

  // ======================================================
  // SELECCIONAR ARCHIVOS
  // ======================================================

  onSelectedFiles(
    event: { currentFiles: File[] }
  ): void {
    const archivosValidos: File[] = [];
    for (const file of event.currentFiles) {
      // Validar tipo
      const esExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (!esExcel) {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo no permitido',
          detail: `${file.name}: solo se permiten excel.`,
          life: 4000
        });
        continue;
      }
      // Validar tamaño
      if (file.size > this.MAX_FILE_SIZE) {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo demasiado grande',
          detail: `${file.name} supera el máximo de 3.5 MB.`,
          life: 4000
        });
        continue;
      }
      archivosValidos.push(file);
    }
    this.files = archivosValidos;
    this.calcularTotalArchivos();
  }

  // ======================================================
  // CALCULAR TAMAÑO TOTAL
  // ======================================================

  private calcularTotalArchivos(): void {

    this.totalSize = this.files.reduce(
      (total: number, file: File) =>
        total + file.size,
      0
    );


    this.totalSizePercent = Math.min(
      (this.totalSize / this.MAX_FILE_SIZE) * 100,
      100
    );
  }

  // ======================================================
  // ELIMINAR ARCHIVO
  // ======================================================

  onRemoveTemplatingFile(
    event: Event,
    file: File,
    removeFileCallback: (
      event: Event,
      index: number
    ) => void,
    index: number
  ): void {

    removeFileCallback(event, index);

    this.files.splice(index, 1);

    this.files = [...this.files];

    this.calcularTotalArchivos();
  }

  // ======================================================
  // LIMPIAR
  // ======================================================

  onClearTemplatingUpload(
    clear: () => void
  ): void {

    clear();

    this.files = [];

    this.totalSize = 0;

    this.totalSizePercent = 0;
  }

  // ======================================================
  // UPLOAD FINALIZADO
  // ======================================================

  onTemplatedUpload(): void {

    this.messageService.add({
      severity: 'success',
      summary: 'Correcto',
      detail: 'Archivo cargado correctamente.',
      life: 3000
    });

  }

  subirExcel(): void {


    if (!this.files || this.files.length === 0) {

      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Advertencia',
      //   detail: 'Debe seleccionar un archivo Excel.'
      // });
      console.log('debe seleccionar un archivo excel');
      
      this.mensaje('Debe seleccionar un archivo Excel.', 'warning', 0,'','');

      return;
    }

    const archivo = this.files[0];

    // Excel
    const esExcel = archivo.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!esExcel) {

      this.messageService.add({
        severity: 'error',
        summary: 'Formato no permitido',
        detail: 'Solo se permiten archivos Excel.'
      });

      return;
    }

    // Máximo 3.5 MB
    const maxSize = 3.5 * 1024 * 1024;

    if (archivo.size > maxSize) {

      this.messageService.add({
        severity: 'error',
        summary: 'Archivo demasiado grande',
        detail: 'El archivo no puede superar los 3.5 MB.'
      });

      return;
    }

    const formData = new FormData();

    formData.append(
      'archivo',
      archivo,
      archivo.name
    );

    formData.append(
      'idPlanta',
      this.idPlanta.toString()
    );

    // console.log('ARCHIVO:', archivo);
    // console.log('NOMBRE:', archivo.name);
    // console.log('TIPO:', archivo.type);
    // console.log('TAMAÑO:', archivo.size);

    this.service.post('Excel/cisternas', formData)
      .subscribe({
        next: (resultado: any) => {
          if (resultado.errores) {
            this.err = resultado.errores
              .filter((y: string) => y.includes('Placa') && y)
              .join('<br>');
          }
          this.mensaje(this.err, 'warning', 1, 'Cerrar', '');
        },
        error: (error) => {
          this.mensaje(error, 'error', 0, '', '')
        }
      });

  }

  actualizarTabla(){
       this.service.get('Excel/listar')
       .subscribe({
         next: (resultado)=>{
           this.excelList = resultado as Excel[];
           /* console.log(resultado) */
         },
         error: (error)=>{
           console.log('1. Configuration =>',error)
         }
       })
  }
  // ======================================================
  // FORMATEAR TAMAÑO
  // ======================================================

  formatSize(bytes: number): string {

    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;

    const sizes = [
      'B',
      'KB',
      'MB',
      'GB'
    ];

    const i = Math.floor(
      Math.log(bytes) /
      Math.log(k)
    );

    const valor = parseFloat(
      (bytes / Math.pow(k, i))
        .toFixed(2)
    );

    return `${valor} ${sizes[i]}`;
  }

  mensaje(mensaje: string, tipo: string, cantBoton: number, nombreBoton1: string, nombreBoton2: string) {
    switch (cantBoton) {
      case 0:
        Swal.fire({
          title: tipo == 'success' ? 'Exito' : 'Error',
          icon: tipo == 'success' ? 'success' : 'error',
          html: mensaje,
          showCancelButton: false,
          showConfirmButton: false,
          timer: 2000,
          willOpen: () => {
            Swal.getContainer()?.style.setProperty('z-index', '99999');
          }
        });
        break;
      case 1:
        Swal.fire({
          title: tipo == 'success' ? 'Exito' : 'Error',
          icon: tipo == 'success' ? 'success' : 'error',
          html: mensaje,
          showCancelButton: false,
          showConfirmButton: true,
          cancelButtonText: nombreBoton1,
          willOpen: () => {
            Swal.getContainer()?.style.setProperty('z-index', '99999');
          }
        });
        break;
      case 2:
        Swal.fire({
          title: tipo == 'success' ? 'Exito' : 'Error',
          icon: tipo == 'success' ? 'success' : 'error',
          html: mensaje,
          showCancelButton: true,
          showConfirmButton: true,
          cancelButtonText: nombreBoton2,
          confirmButtonText: nombreBoton1,
          willOpen: () => {
            Swal.getContainer()?.style.setProperty('z-index', '99999');
          }
        });
        break;

    }

  }

}
