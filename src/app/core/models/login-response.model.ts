import { Usuario } from "./usuario.model";

export interface LoginResponse{
    exito: boolean;
    mensaje:string;
    token:string;
    expira:string;
    usuario:Usuario;
}