import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ImportsModule } from '../../imports';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceServices } from '../../services/service.services';
import { Table } from 'primeng/table';
import { ThemeUtils } from '@primeuix/themes';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { CatalogoService, SelectOption } from '../../services/catalogo.service';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

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

export interface InstanciaTrazabilidad {
  tipo: string;
  codigo: string;
  nombre: string;
  volumen: number;
  idInstancia: number;
}

export interface CertificadoTrazabilidad {
  tipo: string;
  numero: string;
  fechaEmision: string;
  fechaMuestreo: string;
  idCertificado: number;
}

export interface TrazabilidadEvento {
  IdLote: number;
  CodigoTrazabilidad: string;
  IdEvento: number;
  TipoEvento: string;
  FechaEvento: string;
  Estado: string;
  Origenes: InstanciaTrazabilidad[];
  Destinos: InstanciaTrazabilidad[];
  Certificados: CertificadoTrazabilidad[];
}

interface Cisterna {
  volBbls: number,
  placa: string,
  id: number
}

interface PaisOption {
  idPais: number;
  descripcion: string | null;
  abreviacion2: string | null;
  abreviacion3: string | null;
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
  // plantas: SelectOption[] = [];
  plantas = signal<SelectOption[]>([]);
  selectedCountry: SelectOption | null = null;
  formProduccion: FormGroup;
  formPlanta: FormGroup;
  formDespacho: FormGroup;
  tabs: number = 0;
  produccion = signal<any[]>([]);
  selectedCustomers: any[] = [];
  @ViewChild('dt1') dt1!: Table;
  cols!: Column[];
  exportColumns!: ExportColumn[];
  visible: boolean = false;
  visibleImportacion: boolean = false;//importacion
  visibleDespacho: boolean = false;
  visibleUpload: boolean = false;
  idPlanta: number = 0;
  disabled: boolean = false;
  tabDespacho: number = 4;
  pasoDespacho: number = 1;
  files: File[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;
  mostrarTrazabilidad: boolean = false;
  cisterna!: Cisterna[];
  selectedCisterna!: Cisterna[];
  eventos: TrazabilidadEvento[] = [];
  cisterna_list: { conductor: string; id: number; }[] = [];
  listadoConductores: any;
  listCond: any;
  form: any;
  visibleRegCert: boolean = false;
  resultadoTraz: any;
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
  resCisterna: any;
  // ************** IMPORTACION **************
  formProduccionImportacion: FormGroup;//importacion
  formOperador: FormGroup;//importacion
  operador_id: number = 0;//importacion
  operador = signal<SelectOption[]>([]);//importacion
  pais = signal<SelectOption[]>([]);//importacion
  DataOperador: {} = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private serivce: ServiceServices,
    private catalogo: CatalogoService,
    private config: PrimeNG,
    private messageService: MessageService
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
    this.formProduccionImportacion = this.fb.group({
      operador_id: ['', Validators.required],
      nro_certificado_impo: ['', Validators.required],
      vol_total_impo: ['', Validators.required],
      fecha_muestra_impo: ['', Validators.required],
      observacion_impo: ['']
    })
    this.formOperador = this.fb.group({
      cod_operador: ['', Validators.required],
      desc_operador: ['', Validators.required],
      paisImpor: ['', Validators.required],
      punto_ingreso: ['', Validators.required],
      obs_operador: ['']
    })
    /*     this.formDespacho = this.fb.group({
          cantCisterna: [1, [
            Validators.required,
            Validators.min(1),
            Validators.maxLength(2)
          ]],
    
          cisternas: this.fb.array([]),
        }) */
    this.formDespacho = this.fb.group({
      CisternaList: ['', Validators.required]
    })

    this.datosOctano();
    this.cisternasList();
    // this.actualizarCisternas(1);
  }



  // ******************************************************
  // FUNCION INICIAL
  // ******************************************************
  ngOnInit() {
    this.cargarSelectPlanta();
    this.cargarSeleccionPais();
    this.cargarOperador();
    this.cargarProduccion();
    this.formDespacho.get('cantCisterna')?.valueChanges
      .subscribe(valor => {
        this.actualizarCisternas(Number(valor));
      });
  }

  get codigoTrazabilidad(): string {
    return this.eventos.length > 0
      ? this.eventos[0].CodigoTrazabilidad
      : '';
  }

  get volumenInicial(): number {
    return this.eventos.length > 0 &&
      this.eventos[0].Origenes.length > 0
      ? this.eventos[0].Origenes[0].volumen
      : 0;
  }

  iconoTipo(tipo: string): string {

    switch (tipo) {

      case 'PLT':
        return 'pi pi-building';

      case 'TRA':
        return 'pi pi-truck';

      case 'ALM':
        return 'pi pi-database';

      case 'ENG':
        return 'pi pi-box';

      case 'DIS':
        return 'pi pi-map-marker';

      default:
        return 'pi pi-circle';
    }
  }

  nombreTipo(tipo: string): string {

    switch (tipo) {

      case 'PLT':
        return 'Planta';

      case 'TRA':
        return 'Transporte';

      case 'ALM':
        return 'Almacenamiento';

      case 'ENG':
        return 'Engarrafadora';

      case 'DIS':
        return 'Distribuidor';

      default:
        return tipo;
    }
  }

  iconoEvento(evento: string): string {

    switch (evento) {

      case 'DESPACHO':
        return 'pi pi-send';

      case 'RECEPCION':
        return 'pi pi-inbox';

      case 'TRASVASE':
        return 'pi pi-arrow-right-arrow-left';

      case 'DISTRIBUCION':
        return 'pi pi-truck';

      default:
        return 'pi pi-circle';
    }
  }

  formatearFecha(fecha: string): string {

    return new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(fecha));
  }

  datosOctano() {
    this.serivce.get('Calidad/parametros').subscribe({
      next: (respuesta) => {
        console.log('1. octano calidad => ', respuesta)
      },
      error: (error) => { }
    })
  }

  verListado() {
    this.listadoConductores = this.formDespacho.value.CisternaList ?? [];
    // console.log(this.listadoConductores);

    this.listCond = this.listadoConductores.map((x: { conductor: string; }) => ({ conductor: x.conductor }))
  }

  cisternasList() {
    this.serivce.get("Excel/listSel")
      .subscribe({
        next: (resultado) => {
          this.cisterna = resultado as Cisterna[];
          console.log('3.', this.cisterna);

          this.cisterna_list = this.cisterna.map(x => ({ conductor: ' PLACA: ' + x.placa + ' - VOLUMEN: ' + x.volBbls, id: x.id }))
        },
        error: (error) => {
          this.mensaje(error, 'error');
        }
      });
  }

  crearCisterna(): FormGroup {
    return this.fb.group({
      placa: ['', Validators.required],
      presinto: ['', Validators.required],
      volTotalTransporte: ['', Validators.required],
      conductor: ['', Validators.required]
    });
  }

  get cisternas(): FormArray {
    return this.formDespacho.get('cisternas') as FormArray;
  }

  actualizarCisternas(cantidad: number): void {
    if (cantidad > 20) {
      this.formDespacho.value.cantCisterna = this.formDespacho.value.cantCisterna.slice(0, 2);
      return;
    }
    const cant = Number(cantidad) || 0;
    // Agregar cisternas
    while (this.cisternas.length < cant) {
      this.cisternas.push(this.crearCisterna());
    }
    // Quitar cisternas
    while (this.cisternas.length > cant) {
      this.cisternas.removeAt(this.cisternas.length - 1);
    }
  }

  despacharOrigen() {
    Swal.fire({
      title: '🚧 Precaución 🚧',
      icon: 'warning',
      html: ' Desea despachar las Cisternas 🚚?  ',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'No',
      willOpen: () => {
        Swal.getContainer()?.style.setProperty('z-index', '99999');
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.resCisterna = this.formDespacho.value.CisternaList.map((x: { id: any; }) => ({ id: x.id }))
        console.log('1. Despachar cisternas', this.resCisterna);
        console.log({ 'idPlanta': this.idPlanta, 'cisterna': this.resCisterna })
        this.serivce.post('prod/addDespachar', { 'idPlanta': this.idPlanta, 'cisterna': this.resCisterna })
          .subscribe({
            next: (result) => {
              this.visibleDespacho = false;
              this.formDespacho.get('CisternaList')?.setValue([]);
              this.listCond = '';
              this.mensaje('Se registro correctamente los datos', 'success');
              console.log('1. despachar Origen', result)
            },
            error: (error) => { }
          })
      }
    })
  }

  // ******************************************************
  // FUNCION DEL SISTEMA
  // ****************************************************** 

  // cargarSelectPlanta() {
  //   this.catalogo.getPlantas().subscribe({
  //     next: (resultado) => {
  //       this.plantas = resultado
  //     },
  //     error: (error) => {
  //       this.mensaje(error, 'error')
  //     }
  //   })
  // }
  cargarSelectPlanta(): void {
    this.catalogo.getPlantas().subscribe({
      next: (resultado) => {
        this.plantas.set(
          Array.isArray(resultado) ? resultado : []
        );
      },
      error: (error) => {
        this.plantas.set([]);
        this.mensaje(error, 'error');
      }
    });
  }
  /* ============================================== */
  /* IMPORTACION */
  /* ============================================== */
  cargarOperador(): void {
    this.serivce.get('Prod/getOperador')
      .subscribe({
        next: (resultado) => {
          console.log('3. cargarOperador=> ', resultado);

          this.operador.set(Array.isArray(resultado) ? resultado : [])
        },
        error: (error) => {
          this.mensaje(error, 'error');
        }
      })
  }

  cargarSeleccionPais(): void {
    this.serivce.get('Catalogo/pais')
      .subscribe({
        next: (resultado) => {
          this.pais.set(Array.isArray(resultado) ? resultado : [])
          console.log('1. Operador => ', this.operador)
        },
        error: (error) => {
          this.mensaje(error, 'error');
        }
      })
  }

  AgregarOperador() {
    console.log('1. form operadro=> ', this.formOperador.value);
    this.DataOperador = {
      'cod_operador': this.formOperador.value.cod_operador,
      'desc_operador': this.formOperador.value.desc_operador,
      'obs_operador': this.formOperador.value.obs_operador,
      'paisImpor': this.formOperador.value.paisImpor.descripcion,
      'punto_ingreso': this.formOperador.value.punto_ingreso
    }
    this.serivce.post('Prod/AddOperador', this.DataOperador)
      .subscribe({
        next: (resultado) => {
          this.mensaje('Se registro correctamente el Operador', 'success');
          this.visibleImportacion = false;
          this.cargarSeleccionPais();
        },
        error: (error) => {
          this.mensaje(error, 'error');
        }
      })
  }//importacion

  almacenarImportacion() {
    const form = this.formProduccionImportacion.value;
    const dto = {
      plantaId: form.operador_id.idOperador,
      nroCertificado: form.nro_certificado_impo,
      volTotal: form.vol_total_impo,
      fechaMuestra: form.fecha_muestra_impo,
      observacion: form.observacion_impo
    }
    console.log(dto);
    Swal.fire({
      title: '🚧 Esta seguro? 🚧',
      icon: 'warning',
      html: 'Esta seguro de iniciar la producción?',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Si, estoy seguro',
      cancelButtonText: 'No',
      willOpen: () => {
        Swal.getContainer()?.style.setProperty('z-index', '99999');
      }
    }).then((respuesta) => {
      if (respuesta.isConfirmed) {
        this.serivce.post('Prod/addProd', dto)
          .subscribe({
            next: (resultado) => {
              this.mensaje('Se registro Correctamente','success');
              console.log(resultado)
            },
            error: (error) => {
              this.mensaje(error.message, 'error');
            }
          })
      }
    })

  }//importacion

  // ******************************************************
  // FUNCION QUE PERMITE CARGAR LA TABLA DE PRODUCCION
  // ****************************************************** 
  cargarProduccion(): void {

    this.serivce.get('/prod')
      .subscribe({
        next: (resultado: any) => {
          this.produccion.set(Array.isArray(resultado) ? resultado : [])
          // console.log(this.produccion())
        },
        error: (error) => {
          this.mensaje(error, 'error');
          this.produccion.set([]);
        }
      })

  }
  // ******************************************************
  // FUNCION QUE PERMITE CREAR UN LOTE E INICIAR LA TRAZABILIDAD
  // ****************************************************** 
  almacenar() {
    // console.log(this.formProduccion);
    if (this.formProduccion.valid) {
      Swal.fire({
        title: 'Precaución',
        icon: 'success',
        html: '🚧 Esta Seguro de Registrar un nuevo <b>Lote</b>? 🚧',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Si, Estoy Seguro',
        cancelButtonText: 'No',
        willOpen: () => {
          Swal.getContainer()?.style.setProperty('z-index', '99999');
        }
      }).then((resultado) => {
        if (resultado.isConfirmed) {
          const form = this.formProduccion.value;
          const dto = {
            plantaId: form.planta_id.idPlanta,
            nroCertificado: form.nro_certificado,
            volTotal: form.vol_total,
            fechaMuestra: form.fecha_muestra,
            observacion: form.observacion
          }

          this.serivce.post("prod/addProd", dto).subscribe(
            {
              next: (resultado) => {
                // console.log(resultado);
                this.cargarProduccion();
                this.sidebarVisible = false;
                this.mensaje('Se almacenaron correctamente los datos', 'success')
              },
              error: (error) => {
                this.mensaje(error.error?.mensaje ?? error.message ?? 'Ocurrió un error', 'error');
              }
            })
        }
      })
    } else {
      this.mensaje('Debe llenar todos los campos requeridos', 'error');
    }

  }

  AgregarPlanta() {
    if (this.formPlanta.valid) {
      // console.log('1.form planta', this.formPlanta.value)
      Swal.fire({
        title: 'Precaución',
        icon: 'warning',
        html: '<span>Esta Seguro de Crear esta 🚧 <b>Planta</b> 🚧 !! <br/> Los datos no podran ser Eliminados</span>',
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
              this.visible = false;
              this.cargarSelectPlanta();
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

  alCerrar($event: any) {
    // console.log(this.sidebarVisible)
    if (this.sidebarVisible == true) {
      this.visible = false
    }
  }

  cantCisterna() {
    this.form = this.formDespacho.value.cantCisterna
    if (this.form) {
      this.disabled = true;
    } else {
      this.disabled = false;
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

  // ******************************************************
  // MUESTRA LA TRAZABILIDAD
  // ******************************************************

  resultTrazabilidad(traz: string) {
    this.serivce.get("TrazabilidadView?" + "codigoTrazabilidad=" + traz)
      .subscribe({
        next: (res => {
          // console.log(res);

          this.eventos = res as TrazabilidadEvento[];

        }),
        error: (error => {
          this.mensaje(error, 'error');
        })
      });
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
      timer: 2000,
      willOpen: () => {
        Swal.getContainer()?.style.setProperty('z-index', '99999');
      }
    });
  }

  exportarExcel() {
    const datos = this.produccion();

    if (!datos || datos.length === 0) {
      this.mensaje('No existen datos para exportar', 'warning');
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

  showDialog(lugar: string, data: number = 0) {
    switch (lugar) {
      case 'planta':
        this.visible = true;
        break;
      case 'importacion':
        this.visibleImportacion = true;
        break;
      case 'despacho':
        this.visibleDespacho = true;
        this.idPlanta = data;
        break;
      case 'upload':
        this.visibleUpload = true;
        this.idPlanta = data;
        break;
      case 'registroCert':
        this.visibleRegCert = true;
        this.idPlanta = data;
        break;
      case 'trazabilidad':
        this.mostrarTrazabilidad = true;
        this.resultTrazabilidad(String(data));
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
      const esPdf = file.type === 'application/pdf';
      const esImagen = file.type.startsWith('image/');
      if (!esPdf && !esImagen) {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo no permitido',
          detail: `${file.name}: solo se permiten PDF o imágenes.`,
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

  subirCertificado(): void {

    // console.log('ENTRÓ A subirCertificado()');

    if (!this.files || this.files.length === 0) {

      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un certificado.'
      });

      return;
    }

    const archivo = this.files[0];

    // PDF o imagen
    const esPdf = archivo.type === 'application/pdf';
    const esImagen = archivo.type.startsWith('image/');

    if (!esPdf && !esImagen) {

      this.messageService.add({
        severity: 'error',
        summary: 'Formato no permitido',
        detail: 'Solo se permiten archivos PDF o imágenes.'
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

    /*    console.log('ARCHIVO:', archivo);
       console.log('NOMBRE:', archivo.name);
       console.log('TIPO:', archivo.type);
       console.log('TAMAÑO:', archivo.size);
       console.log('ID PLANTA:', this.idPlanta); */

    // Por ahora llegamos hasta aquí.
    // El siguiente paso será enviar formData al backend.
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
}
