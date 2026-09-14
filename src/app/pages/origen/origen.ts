import { Component, OnInit, ViewChild } from '@angular/core';
import { ImportsModule } from '../../imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceServices } from '../../services/service.services';
import { Table } from 'primeng/table';

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
  produccion: any[]=[];

  selectedCustomers: any[]=[];

  @ViewChild('dt') dt!: Table;

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
  exportCSV() {
    this.dt.exportCSV();
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
    this.serivce.get('/prod')
      .subscribe({
        next: (resultado) => {
          console.log('1. produccion = ', resultado);

this.produccion = Array.isArray(resultado)
          ? resultado
          : [];
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  // getSeverity(status: string) {
  //   switch (status) {
  //     case 'unqualified':
  //       return 'danger';

  //     case 'qualified':
  //       return 'success';

  //     case 'new':
  //       return 'info';

  //     case 'negotiation':
  //       return 'warn';

  //     case 'renewal':
  //       return null;
  //   }
  // }
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
