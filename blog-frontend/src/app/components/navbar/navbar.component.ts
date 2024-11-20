import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { FlowbiteService } from '../../service/flowbite.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  // user need to be authorized to comment otherwise messagew will be displayed
  // same as comment component, user needs to be authorized

  //example
  isAuthorize = false;
  searchTerm: string = '';
  @Output() searchEvent = new EventEmitter<string>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private flowbiteService: FlowbiteService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
    this.flowbiteService.loadFlowbite((flowbite) => {});

    const id = sessionStorage.getItem('token');

    if (id) {
      this.isAuthorize = true;
    }
  }

  onSearchInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value;
  }

  onSearch(): void {
    this.searchEvent.emit(this.searchTerm);
  }

  logoutUser() {
    // logout
    Swal.fire({
      title: 'Logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'success',
          title: 'Logout successfully',
        });
        sessionStorage.clear();
        this.router.navigate(['home']);
      }
    });
  }

  createPost() {
    this.router.navigate(['create']);
  }
}
