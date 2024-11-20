import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { NavbarComponent } from './components/navbar/navbar.component';
import { isPlatformBrowser } from '@angular/common';
import { FlowbiteService } from './service/flowbite.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'blog-frontend';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private flowbiteService: FlowbiteService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
    this.flowbiteService.loadFlowbite((flowbite) => {});
  }
}
