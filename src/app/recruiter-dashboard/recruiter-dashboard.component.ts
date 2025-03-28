import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiter-dashboard.component.html',
})
export class RecruiterDashboardComponent implements OnInit {
  jobPosts: any[] = [];
  fullName = '';
  password = '';
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadJobPosts();
  }

  loadProfile() {
    this.http.get<any>('http://localhost:3000/users/me').subscribe({
      next: (user) => {
        this.fullName = user.fullName;
      },
      error: () => (this.error = 'Failed to load profile'),
    });
  }

  loadJobPosts() {
    this.http.get<any[]>('http://localhost:3000/job-posts/my').subscribe({
      next: (data) => (this.jobPosts = data),
      error: () => (this.error = 'Failed to load job posts'),
    });
  }

  updateProfile() {
    this.http
      .patch('http://localhost:3000/users/me', {
        fullName: this.fullName,
        passwordHash: this.password || undefined,
      })
      .subscribe({
        next: () => alert('Profile updated!'),
        error: () => alert('Update failed'),
      });
  }

  hire(applicationId: number) {
    this.http
      .patch(`http://localhost:3000/applications/${applicationId}`, {
        status: 'hired',
      })
      .subscribe({
        next: () => {
          // refresh posts to reflect new status
          this.loadJobPosts();
        },
        error: () => alert('Failed to hire candidate'),
      });
  }
}
