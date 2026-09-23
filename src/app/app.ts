import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemesService } from './services/themes.service';

@Component({
  imports: [RouterOutlet],
  standalone: true,
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App  implements OnInit {

  constructor(
    private themeService: ThemesService
  ) {}

  ngOnInit(): void {
    this.themeService.inicializarTema();
  }
}
