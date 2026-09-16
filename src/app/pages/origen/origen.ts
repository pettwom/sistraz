import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ImportsModule } from '../../imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceServices } from '../../services/service.services';
import { Table } from 'primeng/table';
import { ThemeUtils } from '@primeuix/themes';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { CatalogoService, SelectOption } from '../../services/catalogo.service';
interface ExportColumn {
  title: string;
  dataKey: string;
}
interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}
interface Departamento {
  name: string;
  code: string;
}

@Component({
  selector: 'app-origen',
  imports: [ImportsModule],
  templateUrl: './origen.html',
  styleUrl: './origen.css',
})

export class Origen implements OnInit {
  // ******************************************************
  // DECLARACOIN DE VARIABLES
  // ******************************************************
  sidebarVisible: boolean = false;
  activeIndex: number = 0;
  date: Date[] | undefined;
  vol_total: number = 0;
  nro_certificado: string = '';
  plantas: SelectOption[] = [];
  selectedCountry: SelectOption | null = null;
  formProduccion: FormGroup;
  formPlanta: FormGroup;
  produccion = signal<any[]>([]);
  selectedCustomers: any[] = [];
  @ViewChild('dt1') dt1!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];
  visible: boolean = false;
  // ciudad: City[] | undefined;
  // selectedCity: City | undefined;
  departamento: Departamento[] = [
    { name: 'CHUQUISACA', code: 'ch' },
    { name: 'LA PAZ', code: 'lp' },
    { name: 'COCHABAMBA', code: 'cb' },
    { name: 'SANTA CRUZ', code: 'sc' },
    { name: 'ORURO', code: 'or' },
    { name: 'POTOSI', code: 'pt' },
    { name: 'TARIJA', code: 'tj' },
    { name: 'BENI', code: 'bn' },
    { name: 'PANDO', code: 'pn' },
  ];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serivce: ServiceServices,
    private catalogo: CatalogoService
  ) {
    this.formPlanta = this.fb.group({
      cod_planta: ['', Validators.required],
      desc_planta: ['', Validators.required],
      obs_planta: [''],
      ciudad: [''],
    })
    this.formProduccion = this.fb.group({
      planta_id: ['', Validators.required],
      nro_certificado: ['', Validators.required],
      vol_total: ['', Validators.required],
      fecha_muestra: ['', Validators.required],
      observacion: ['']
    })
  }

  // ******************************************************
  // FUNCION INICIAL
  // ******************************************************
  ngOnInit() {
    this.catalogo.getPlantas().subscribe({
      next: (resultado) => {
        this.plantas = resultado
      },
      error: (error) => {
        this.mensaje(error, 'error')
      }
    })
    this.cargarProduccion();

  }

  // ******************************************************
  // FUNCION DEL SISTEMA
  // ******************************************************  
  cargarProduccion(): void {

    this.serivce.get('/prod')
      .subscribe({
        next: (resultado: any) => {
          this.produccion.set(Array.isArray(resultado) ? resultado : [])
        },
        error: (error) => {
          this.mensaje(error, 'error');
          this.produccion.set([]);
        }
      })

  }

  almacenar() {
    console.log(this.formProduccion);
    // this.serivce.post("api/prod/add", this.formProduccion).subscribe(
    //   {
    //     next: (resultado) => {
    //       console.log(resultado);
    //       this.mensaje('Se almacenaron correctamente los datos', 'success')
    //     },
    //     error: (error) => {
    //       this.mensaje(error, 'error');
    //     }
    //   })
  }

  AgregarPlanta() {
    if (this.formPlanta.valid) {
      console.log('1.form planta', this.formPlanta.value)
      Swal.fire({
        title: 'Precaución',
        icon: 'warning',
        text: 'Esta Seguro de Crear esta Planta!!',
        confirmButtonText: 'Si estoy Seguro',
        cancelButtonText: 'No',
        showCancelButton: true,
        willOpen: () => {
          Swal.getContainer()?.style.setProperty('z-index', '99999');
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.serivce.post("prod/addPlanta", this.formPlanta.value).subscribe({
            next: (resultado) => {
              this.mensaje('Se almaceno correctamete!!', 'success');
            },
            error: (error) => {
              console.log('STATUS:', error.status);
              console.log('RESPUESTA:', error.error);

              if (error.status === 409) {

                Swal.fire({
                  icon: 'warning',
                  title: 'Registro duplicado',
                  text: error.error?.mensaje,
                  willOpen: () => {
                    Swal.getContainer()?.style.setProperty('z-index', '99999');
                  }
                });

                return;
              }

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.error?.mensaje ?? 'Ocurrió un error inesperado',
                willOpen: () => {
                  Swal.getContainer()?.style.setProperty('z-index', '99999');
                }
              });
            }
          });
        }
      })

    } else {
      this.mensaje('Debe Completar todos los campos requeridos', 'error');
    }
  }

  // ******************************************************
  // CODIGO COMPLEMENTARIO
  // ******************************************************
  convertirMayusculas(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    const valor = input.value.toUpperCase();
    // Cambia visualmente el input
    input.value = valor;
    this.formProduccion.get(campo)?.setValue(valor, { emitEvent: false })
  }

  obtenerFecha(): string {
    const fecha = new Date();
    const dia = String(
      fecha.getDate()
    ).padStart(2, '0');

    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, '0');

    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  mensaje(mensaje: string, tipo: string) {

    Swal.fire({
      title: tipo == 'success' ? 'Exito' : 'Error',
      icon: tipo == 'success' ? 'success' : 'error',
      text: mensaje,
      showCancelButton: false,
      showConfirmButton: false,
      timer: 2000
    })
  }

  exportarExcel() {
    const datos = this.produccion();

    if (!datos || datos.length === 0) {
      console.warn('No existen datos para exportar');
      return;
    }

    const datosExcel = datos.map(item => ({
      'Nro. LOTE': item.lote ?? '',
      'Planta/Operador': item.nombre ?? '',
      'Nro. Certificado': item.numCertificacion ?? '',
      'Fecha Muestreo': item.fechaMuestreo
        ? new Date(item.fechaMuestreo)
        : '',
      'Volumen Total (Tn)': item.volTotal ?? 0,
      'País': item.pais || '---------',
      'Punto Ingreso': item.puntoIngreso || '---------',
      'Estado': 'Activo'
    }));

    const hoja: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(datosExcel);

    // Ancho de columnas
    hoja['!cols'] = [
      { wch: 30 }, // Lote
      { wch: 25 }, // Planta
      { wch: 25 }, // Certificado
      { wch: 20 }, // Fecha
      { wch: 20 }, // Volumen
      { wch: 20 }, // País
      { wch: 25 }, // Punto ingreso
      { wch: 15 }  // Estado
    ];

    // Crear libro
    const libro: XLSX.WorkBook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      'Producción'
    );

    // Nombre del archivo
    const fecha = new Date();

    const nombreArchivo =
      `Produccion_${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, '0')}-${String(
        fecha.getDate()
      ).padStart(2, '0')}.xlsx`;

    XLSX.writeFile(
      libro,
      nombreArchivo
    );
  }

  showDialog() {
    this.visible = true;
  }

}
