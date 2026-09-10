export interface Usuario {

    idUsuarioHydro: number;

    idEntidad?: number;

    nombreCompleto: string;

    correo: string;

    entidad: string;

    direccion?: string;

    denominacionUnidad?: string;

    cargo?: string;

    ci?: string;

    idOrganigrama?: number;

    fotografia?: string;

    cantidadBandeja: number;

    perfiles: string[];
}