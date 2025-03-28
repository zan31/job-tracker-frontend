import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-job',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.scss',
})
export class CreateJobComponent {
  job = {
    title: '',
    description: '',
    location: '',
    salaryRange: '',
  };

  error: string | null = null;
  success = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.error = null;
    this.success = false;

    this.http.post('http://localhost:3000/job-posts', this.job).subscribe({
      next: () => {
        this.success = true;
        this.job = {
          title: '',
          description: '',
          location: '',
          salaryRange: '',
        };
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create job post';
      },
    });
  }
}
