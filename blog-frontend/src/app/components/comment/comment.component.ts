import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BlogService } from '../../service/blog.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ActivationEnd } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css',
})
export class CommentComponent implements OnInit {
  // user need to be authorized to comment otherwise message will be displayed
  // check if the user is authorized to comment

  //example
  isAuthorize = false;
  commentForm: any;
  userId: any = sessionStorage.getItem('token');
  blogId: any;
  comments: any[] = [];
  isDropdownOpen: boolean[] = [];
  isEditing: boolean = false;
  isAuthor: boolean = false;
  editingCommentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private aRoute: ActivatedRoute
  ) {
    this.aRoute.params.subscribe((params) => {
      this.blogId = +params['id'];
    });

    console.log(this.blogId);

    this.commentForm = this.fb.group({
      postid: [this.blogId],
      userid: [this.userId],
      comment: [''],
    });
  }

  ngOnInit(): void {
    if (this.userId !== null) {
      this.isAuthorize = true;
    }

    this.getComments(this.blogId);
  }

  getComments(id: any) {
    this.blogService.getAllComments(id).subscribe((res: any) => {
      this.comments = res;
      console.log(res);

      this.comments.forEach((comment: any) => {
        const user_id = comment.userid;
        console.log(user_id);

        if (user_id == this.userId) {
          this.isAuthor = true;
          console.log('Author', this.isAuthor);
        }
      });

      this.isDropdownOpen = new Array(this.comments.length).fill(false);
    });
  }

  toggleDropdown(index: number) {
    this.isDropdownOpen[index] = !this.isDropdownOpen[index];
  }

  submitComment() {
    // Ensure `postid` is always updated with the current blog ID
    this.commentForm.patchValue({
      postid: this.blogId,
    });

    if (this.isEditing && this.isAuthor) {
      const updateData = {
        id: this.editingCommentId,
        postid: this.blogId,
        userid: this.userId,
        comment: this.commentForm.value.comment,
      };
      this.blogService.updateComment(updateData).subscribe((res: any) => {
        if (res.status === 200) {
          Swal.fire('Updated!', 'Your comment was updated.', 'success');
          this.isEditing = false;
          this.commentForm.reset();
          this.getComments(this.blogId);
        }
      });
    } else {
      this.blogService
        .createComment(this.commentForm.value)
        .subscribe((res: any) => {
          if (res) {
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              },
            });
            Toast.fire({
              icon: 'success',
              title: 'Comment was created.',
            });
            this.commentForm.reset();
            this.getComments(this.blogId);
          }
        });
    }
  }

  editComment(comment: any) {
    this.commentForm.patchValue({
      content: comment.content,
    });
    this.isEditing = true;
    this.editingCommentId = comment.id;
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingCommentId = null;
    this.commentForm.reset();
  }

  deleteComment(id: number) {
    console.log(id);
    let data: any = {
      id: id,
      user_id: this.userId,
    };

    Swal.fire({
      title: 'Delete comment?',
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
        this.blogService.deleteComment(data).subscribe((res: any) => {
          Toast.fire({
            icon: 'success',
            title: 'Comment deleted successfully',
          });
          this.getComments(this.blogId);
        });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    this.comments.forEach((comment, index) => {
      const dropdownButton = document.getElementById(
        `dropdown-button-${index}`
      );
      const dropdownMenu = document.getElementById(`dropdown-menu-${index}`);

      if (dropdownButton && dropdownMenu) {
        const clickedOutside =
          !dropdownButton.contains(event.target as Node) &&
          !dropdownMenu.contains(event.target as Node);
        if (clickedOutside) {
          this.isDropdownOpen[index] = false;
        }
      }
    });
  }

  removeDocumentClickListener() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }
}
