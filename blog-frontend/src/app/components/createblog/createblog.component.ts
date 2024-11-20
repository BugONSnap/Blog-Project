import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule, Location } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BlogService } from '../../service/blog.service';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';
import { QuillEditorBase, QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-createblog',
  standalone: true,
  imports: [
    NavbarComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    QuillModule,
  ],
  templateUrl: './createblog.component.html',
  styleUrl: './createblog.component.css',
})
export class CreateblogComponent implements OnInit {
  blogForm!: FormGroup;
  postCreated: boolean = false;
  imageUrl: string | ArrayBuffer | null = null;
  userId: number | undefined;
  image: File | null = null;

  quillConfig = {
    toolbar: [
      // ['bold', 'italic', 'undeline', 'image'], // toggled buttons
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
    private blogService: BlogService,
    private authService: AuthService
  ) {
    const token = sessionStorage.getItem('token');
    if (token === null) {
      return;
    }

    this.userId = parseInt(token);
    console.log(this.userId);
  }

  ngOnInit(): void {
    this.blogForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });
  }

  // get tags(): FormArray {
  //   return this.blogForm.get('tags') as FormArray;
  // }

  // addTag(tag: string) {
  //   if (tag) {
  //     this.tags.push(this.fb.control(tag));
  //   }
  // }

  // removeTag(index: number) {
  //   this.tags.removeAt(index);
  // }

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

  public blur(): void {
    console.log('blur');
  }

  public onSelectionChanged(): void {
    console.log('onSelectionChanged');
  }

  createBlog_() {
    if (this.blogForm.valid) {
      this.blogService.createBlogPost(this.blogForm.value).subscribe(
        (response) => {
          if (response.status === 200) {
            Swal.fire('', 'Blog successfully created', 'success');
            this.blogForm.reset();
          }
        },
        (error) => {
          alert('Error creating blog post.');
          console.error(error);
        }
      );
    }
  }

  createBlog() {
    const formData = new FormData();

    if (this.userId) {
      formData.append('userid', this.userId.toString());
    }
    formData.append('title', this.blogForm.get('title')?.value);
    formData.append('description', this.blogForm.get('description')?.value);
    if (this.image) {
      formData.append('image', this.image as Blob);
    }

    this.blogService.createPost(formData).subscribe(
      (response) => {
        if (response) {
          Swal.fire('', 'Blog successfully created', 'success');
          this.blogForm.reset();
          this.postCreated = true;
        } else {
          Swal.fire('Error', 'Failed to create blog.', 'error');
        }
      },
      (error) => {
        console.error('Error creating blog post.', error);
        Swal.fire('Error', 'Something went wrong!', 'error');
      }
    );
  }

  cancelPost = () => {
    this.location.back();
  };
}
