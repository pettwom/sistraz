import { Component, EventEmitter, Output} from '@angular/core';
import { RouterLink, Router  } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Output()
  closeMenu = new EventEmitter<void>();

  constructor(private router: Router){}
  cerrarMenu() {
    this.closeMenu.emit();
  }
  cerrarSession(event: Event){
    event.preventDefault();
    this.router.navigate(['/login'])
  }
}
