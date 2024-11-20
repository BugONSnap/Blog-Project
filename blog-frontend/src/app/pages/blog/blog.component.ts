import {
  Component,
  HostListener,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommentComponent } from '../../components/comment/comment.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../service/blog.service';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommentComponent, NavbarComponent, CommonModule, QuillModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
})
export class BlogComponent implements OnInit {
  blogId: any;
  blog: any = {};
  id: any = sessionStorage.getItem('token');
  isAuthor: boolean = false;
  isDropdownOpen: boolean = false;
  webContent: SafeHtml | undefined;

  constructor(
    private router: Router,
    private arouter: ActivatedRoute,
    private service: BlogService,
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.arouter.params.subscribe((params) => {
      this.blogId = +params['id'];
      this.loadBlog(this.blogId);
    });
  }

  loadBlog(id: number) {
    this.service.getAllBlogs(id).subscribe((blog: any) => {
      if (blog) {
        this.blog = blog[0];
        console.log(this.blog);

        this.webContent = this.sanitizer.bypassSecurityTrustHtml(
          this.blog.description.replace(/<\/p><p>/g, '<br>')
        );

        if (this.id == this.blog.userid) {
          this.isAuthor = true;
        }
      }
    });
  }

  editPost(id: any) {
    this.router.navigate(['edit/', id]);
  }

  deletePost(id: any) {
    let blogDetails = {
      postid: this.blogId,
    };

    Swal.fire({
      title: 'Delete Post?',
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
        this.service.deletePost(blogDetails).subscribe((res: any) => {
          Toast.fire({
            icon: 'success',
            title: 'Deleted successfully',
          });
          this.location.back();
        });
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
