import { Component } from '@angular/core';
import { ImportsModule } from '../../imports';
@Component({
  selector: 'app-origen',
  imports: [ImportsModule],
  templateUrl: './origen.html',
  styleUrl: './origen.css',
})
export class Origen {

  sidebarVisible: boolean = false;
  activeIndex: number = 0;
}
