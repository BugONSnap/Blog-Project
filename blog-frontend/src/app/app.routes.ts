import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { BlogComponent } from './pages/blog/blog.component';
import { EditComponent } from './components/edit/edit.component';
import { CreateblogComponent } from './components/createblog/createblog.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'register',
    component: RegisterComponent,
  },

  {
    path: 'blog/:id',
    component: BlogComponent,
  },

  {
    path: 'create',
    component: CreateblogComponent,
  },

  {
    path: 'edit/:id',
    component: EditComponent,
  },
];
