import { Component } from '@angular/core';
import { BlogComponent } from '../blog/blog.component';
import { BlogCardComponent } from '../blog-card/blog-card.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BlogComponent, BlogCardComponent, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor() {}
}
