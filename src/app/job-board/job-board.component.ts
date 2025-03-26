import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-board',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-board.component.html',
})
export class JobBoardComponent implements OnInit {
  jobPosts: any[] = [];
  appliedJobIds: number[] = [];
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadJobPosts();
    //this.loadApplications();
  }

  loadJobPosts() {
    this.http.get<any[]>('http://localhost:3000/job-posts').subscribe({
      next: (data) => (this.jobPosts = data),
      error: () => (this.error = 'Failed to load job posts'),
    });
  }

  loadApplications() {
    this.http.get<any[]>('http://localhost:3000/applications/my').subscribe({
      next: (apps) => {
        this.appliedJobIds = apps.map((a) => a.jobPost.id);
      },
      error: () => console.log('Failed to load applications'),
    });
  }

  apply(jobPostId: number) {
    this.http
      .post('http://localhost:3000/applications', { jobPostId })
      .subscribe({
        next: () => this.appliedJobIds.push(jobPostId),
        error: () => alert('Already applied or error occurred'),
      });
  }

  hasApplied(jobId: number): boolean {
    return this.appliedJobIds.includes(jobId);
  }
}
