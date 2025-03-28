import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent implements OnInit {
  fullName = '';
  password = '';
  file: File | null = null;
  cvUrl: string | null = null;
  applications: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadApplications();
  }

  loadProfile() {
    this.http.get<any>('http://localhost:3000/users/me').subscribe((user) => {
      this.fullName = user.fullName;
      this.cvUrl = user.cvUrl;
    });
  }

  loadApplications() {
    this.http.get<any[]>('http://localhost:3000/applications/my').subscribe({
      next: (apps) => (this.applications = apps),
    });
  }

  updateProfile() {
    this.http
      .patch('http://localhost:3000/users/me', {
        fullName: this.fullName,
        passwordHash: this.password || undefined,
      })
      .subscribe(() => alert('Profile updated!'));
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  uploadCv() {
    if (!this.file) return;

    this.http
      .post<{ uploadUrl: string; fileUrl: string }>(
        'http://localhost:3000/users/me/presigned-cv-upload',
        {}
      )
      .subscribe({
        next: ({ uploadUrl, fileUrl }) => {
          this.http
            .put(uploadUrl, this.file!, {
              headers: { 'Content-Type': this.file!.type },
            })
            .subscribe({
              next: () => {
                this.http
                  .patch('http://localhost:3000/users/me', {
                    cvUrl: fileUrl,
                  })
                  .subscribe(() => {
                    this.cvUrl = fileUrl;
                    this.http
                      .patch('http://localhost:3000/users/me', {
                        cvUrl: fileUrl,
                      })
                      .subscribe(() => {
                        this.cvUrl = fileUrl;
                        alert('CV uploaded and saved!');
                      });
                  });
              },
              error: () => alert('Failed to upload to S3'),
            });
        },
        error: () => alert('Failed to get presigned URL'),
      });
  }
}
