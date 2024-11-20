import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormArray,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  FormsModule,
} from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { BlogService } from '../../service/blog.service';
import { identifierName } from '@angular/compiler';
import Swal from 'sweetalert2';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    QuillModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent implements OnInit {
  blogForm!: FormGroup;
  postCreated: boolean = false;
  userId: number | null = null;
  blogId: number | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  image: File | null = null;

  quillConfig = {
    toolbar: [
      // ['bold', 'italic', 'undeline', 'code-block', 'image'], // toggled buttons
      // [{ header: 1 }, { header: 2 }],
      // [{ list: 'ordered' }, { list: 'bullet' }],
      // [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      // [{ direction: 'rtl' }], // text direction

      // [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      // [{ header: [1, 2, 3, 4, 5, 6, false] }],

      // [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      // [{ font: [] }],
      // [{ align: [] }],

      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote'],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction

      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ['clean'], // remove formatting button

      ['image'],
    ],
  };

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private authService: AuthService,
    private blogService: BlogService,
    private arouter: ActivatedRoute
  ) {
    const token = sessionStorage.getItem('token');
    if (token === null) {
      return;
    }

    this.userId = parseInt(token);

    // Initialize the form using FormBuilder for cleaner syntax
    this.blogForm = this.fb.group({
      postid: [this.blogId],
      title: ['', Validators.required],
      description: ['', Validators.required],
      user_id: [this.userId],
    });
  }

  ngOnInit(): void {
    this.arouter.params.subscribe((params) => {
      this.blogId = +params['id'];
      if (this.blogId) {
        this.blogService.getAllBlogs(this.blogId).subscribe((blog: any) => {
          if (blog && blog.length > 0) {
            if (blog[0].photo) {
              const extension = 'http://localhost/BlogSphere/pdo/images/posts/';
              this.imageUrl = extension + blog[0].photo;
            }

            console.log(this.imageUrl);

            this.blogForm.patchValue({
              postid: blog[0].postid,
              title: blog[0].title,
              description: blog[0].description,
              user_id: this.userId,
            });
          }
        });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.image = input.files[0];
      const fileType = this.image.type;

      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageUrl = reader.result;
        };
        reader.readAsDataURL(this.image);
      } else {
        console.error('Selected file is not an image.');
      }
    }
  }

  // Update Blog - Logic to update the blog
  updateBlog() {
    // Check if the form is valid before submitting
    if (this.blogForm.valid) {
      const formData = new FormData();

      // Append form data to FormData object
      if (this.userId) {
        formData.append('user_id', this.userId.toString()); // Ensure backend expects 'user_id'
      }
      formData.append('postid', this.blogForm.get('postid')?.value); // Append postid
      formData.append('title', this.blogForm.get('title')?.value);
      formData.append('description', this.blogForm.get('description')?.value); // Description from Quill editor

      // Append image if it exists
      if (this.image) {
        formData.append('image', this.image as Blob);
      }

      // Call the blogService to update the post
      this.blogService.updatePost(formData).subscribe(
        (response) => {
          if (response) {
            Swal.fire('', 'Blog successfully updated', 'success');
          } else {
            Swal.fire('Error', 'Failed to update blog.', 'error');
          }
        },
        (error) => {
          console.error('Error updating blog post.', error);
          Swal.fire('Error', 'Something went wrong!', 'error');
        }
      );
    } else {
      Swal.fire('Invalid Data', 'Please fill in all required fields.', 'error');
    }
  }

  goBack() {
    this.location.back();
  }
}
