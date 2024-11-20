import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpResponse } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private registerService: BlogService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  registerUser() {
    if (!this.registerForm.valid) {
      Swal.fire('Incomplete Data', 'Please fill in all fields', 'warning');
    }

    this.registerService
      .registerUser(this.registerForm.value)
      .subscribe((res) => {
        console.log(res);
        if (res) {
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
            title: 'Registered in successfully',
          }).then(() => {
            this.router.navigate(['login']);
          });
        }
      });
  }
}
