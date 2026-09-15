import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ImportsModule } from '../../imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceServices } from '../../services/service.services';
import { Table } from 'primeng/table';
import { ThemeUtils } from '@primeuix/themes';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

interface Country {
  name: string;
  code: string;
}
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
  countries: Country[] = [];
  selectedCountry: Country | null = null;
  formProduccion: FormGroup;
  // produccion: any[] = [];
  produccion = signal<any[]>([]); //cambio 1
  selectedCustomers: any[] = [];
  @ViewChild('dt1') dt1!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serivce: ServiceServices,
  ) {
    this.formProduccion = this.fb.group({
      planta_id: ['', Validators.required],
      nro_certificado: ['', Validators.required],
      vol_total: ['', Validators.required],
      fecha_muestra: ['', Validators.required
      ]
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

  exportCSV() {
    const datos = this.produccion();

    if (!datos || datos.length === 0) {
      Swal.fire({
        title: 'Precaución',
        icon: 'warning',
        text: 'No existe datos para exportar',
        timer: 2000,
        showCancelButton: false,
        showConfirmButton: false
      })
      return;
    }

    const encabezados = [
      'Nro. LOTE',
      'Planta/Operador',
      'Nro. Certificado',
      'Fecha Muestreo',
      'Volumen Total (Tn)',
      'Pais',
      'Punto Ingreso',
      'Estado'
    ];

    const filas = datos.map(item => [
      item.lote ?? '',
      item.nombre ?? '',
      item.numCertificacion ?? '',
      item.fechaMuestreo ?? '',
      item.volTotal ?? '',
      item.pais ?? '',
      item.puntoIngreso ?? '',
      'Activo'
    ]);

    const contenido = [
      encabezados,
      ...filas
    ]
      .map(fila =>
        fila
          .map(valor =>
            `"${String(valor).replace(/"/g, '""')}"`
          )
          .join(';')
      )
      .join('\n');

    // BOM para que Excel reconozca correctamente UTF-8
    const blob = new Blob(
      ['\uFEFF' + contenido],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement('a');

    enlace.href = url;

    enlace.download =
      `produccion_${this.obtenerFecha()}.csv`;

    enlace.click();

    URL.revokeObjectURL(url);
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
    this.countries = [
      { name: 'Australia', code: 'AU' },
      { name: 'Brazil', code: 'BR' },
      { name: 'China', code: 'CN' },
      { name: 'Egypt', code: 'EG' },
      { name: 'France', code: 'FR' },
      { name: 'Germany', code: 'DE' },
      { name: 'India', code: 'IN' },
      { name: 'Japan', code: 'JP' },
      { name: 'Spain', code: 'ES' },
      { name: 'United States', code: 'US' }
    ];
    this.cargarProduccion();
  }

  cargarProduccion(): void {

    this.serivce.get('/prod')
      .subscribe({
        next: (resultado: any) => {
          console.log('1. produccion = ', resultado);


          this.produccion.set(Array.isArray(resultado) ? resultado : [])//cambio 2
          // this.produccion = Array.isArray(resultado)
          //   ? resultado
          //   : [];
        },
        error: (error) => {
          console.log(error);
          this.produccion.set([]);//cambio 3
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
