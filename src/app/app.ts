import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { ImportsModule } from './imports';
// import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';


@Component({
  // imports: [RouterOutlet, ReactiveFormsModule, ImportsModule],
  imports: [RouterOutlet],
  standalone: true,
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // formGroup: FormGroup;

  // cities = [
  //   { name: 'La Paz', code: 'LP' },
  //   { name: 'Cochabamba', code: 'CB' },
  //   { name: 'Santa Cruz', code: 'SC' },
  //   { name: 'Oruro', code: 'OR' }
  // ];

  // constructor(private fb: FormBuilder) {
  //   this.formGroup = this.fb.group({
  //     selectedCities: [[]],
  //   });
  // }
}
