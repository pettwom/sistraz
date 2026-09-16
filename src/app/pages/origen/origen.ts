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
@Component({
  selector: 'app-origen',
  imports: [ImportsModule],
  templateUrl: './origen.html',
  styleUrl: './origen.css',
})
export class Origen implements OnInit {

  sidebarVisible: boolean = false;
  activeIndex: number = 0;
  date: Date[] | undefined;
  vol_total: number = 0;
  nro_certificado: string = '';
  plantas: SelectOption[] = [];
  selectedCountry: SelectOption | null = null;
  formProduccion: FormGroup;
  produccion = signal<any[]>([]);
  selectedCustomers: any[] = [];
  @ViewChild('dt1') dt1!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serivce: ServiceServices,
    private catalogo: CatalogoService
  ) {
    this.formProduccion = this.fb.group({
      planta_id: ['', Validators.required],
      nro_certificado: ['', Validators.required],
      vol_total: ['', Validators.required],
      fecha_muestra: ['', Validators.required],
      observacion: ['']
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

  ngOnInit() {
    this.catalogo.getPlantas().subscribe({
      next: (resultado)=>{
        this.plantas = resultado
      },
      error: (error)=>{

      }
    })
    this.cargarProduccion();
  }

  cargarProduccion(): void {

    this.serivce.get('/prod')
      .subscribe({
        next: (resultado: any) => {

          this.produccion.set(Array.isArray(resultado) ? resultado : [])//cambio 2

        },
        error: (error) => {
          console.log(error);
          this.produccion.set([]);
        }
      })

  }


  convertirMayusculas(event: Event) {
    console.log('1. convertir mayusculas: ', event);

    const input = event.target as HTMLInputElement;
    const valor = input.value.toUpperCase();
    this.formProduccion.get('nro_certificado')?.setValue(valor, { emitEvent: false })
  }

  almacenar() {
    console.log(this.formProduccion);

  }
}
