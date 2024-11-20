import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { CommentComponent } from '../../components/comment/comment.component';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BlogService } from '../../service/blog.service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommentComponent, CommonModule, NavbarComponent, FormsModule],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.css',
})
export class BlogCardComponent {
  blogs: any[] = [];
  filteredBlogs: any[] = [];
  searchTerm: string = '';
  hasTags: boolean = false;

  constructor(
    private router: Router,
    private service: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getBlogs();
  }

  // todo -- pass blog id to blog component (later)
  goToBlog(id: number) {
    this.router.navigate(['/blog/', id]);
  }

  // getBlogs() {
  //   this.service.getAllBlogs().subscribe(
  //     (response: any) => {
  //       this.blogs = response.data || [];
  //       this.filteredBlogs = this.blogs;
  //       console.log('Fetched Blogs:', this.blogs);
  //       console.log('filteredBlogsBlogs:', this.filteredBlogs);
  //     },
  //     (error) => {
  //       console.error('Error fetching blogs:', error);
  //       this.blogs = [];
  //       this.filteredBlogs = [];
  //     }
  //   );
  // }

  getBlogs() {
    this.service.getAllBlogs().subscribe(
      (response: any) => {
        this.blogs = response || [];
        this.filteredBlogs = this.blogs;

        // Check if any blog has tags
        // this.hasTags = this.blogs.some(
        //   (blog) => blog.tags && blog.tags.trim().length > 0
        // );
        console.log('Fetched Blogs:', this.blogs);
      },
      (error) => {
        console.error('Error fetching blogs:', error);
        this.blogs = [];
        this.filteredBlogs = [];
        this.hasTags = false;
      }
    );
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value;
    this.filterBlogs(searchTerm);
  }

  filterBlogs(searchTerm: string) {
    if (!searchTerm) {
      this.filteredBlogs = this.blogs || [];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredBlogs = (this.blogs || []).filter(
      (blog) =>
        blog.title.toLowerCase().includes(term) ||
        (blog.tags && blog.tags.toLowerCase().includes(term))
    );
  }

  searchBlogs() {
    if (this.searchTerm.trim() === '') {
      this.filteredBlogs = this.blogs;
      return;
    }

    const tags = this.searchTerm.split(',').map((tag) => tag.trim());
    this.service.searchBlogsByTags(tags).subscribe(
      (response) => {
        this.filteredBlogs = response;
      },
      (error) => {
        console.error('Error fetching search results', error);
        this.filteredBlogs = [];
      }
    );
  }
}
