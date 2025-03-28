import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

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
  modalTitle = '';
  modalMessage = '';
  modalAction: (() => void) | null = null;
  editJob: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadJobPosts();
  }

  loadProfile() {
    this.http
      .get<any>('https://job-tracker-backend-s1bg.onrender.com/users/me')
      .subscribe({
        next: (user) => {
          this.fullName = user.fullName;
        },
        error: () => (this.error = 'Failed to load profile'),
      });
  }

  loadJobPosts() {
    this.http
      .get<any[]>('https://job-tracker-backend-s1bg.onrender.com/job-posts/my')
      .subscribe({
        next: (data) => (this.jobPosts = data),
        error: () => (this.error = 'Failed to load job posts'),
      });
  }

  updateProfile() {
    this.http
      .patch('https://job-tracker-backend-s1bg.onrender.com/users/me', {
        fullName: this.fullName,
        passwordHash: this.password || undefined,
      })
      .subscribe({
        next: () => this.showToast('Profile updated!', 'success'),
        error: () => this.showToast('Update failed', 'danger'),
      });
  }

  hire(applicationId: number) {
    this.http
      .patch(
        `https://job-tracker-backend-s1bg.onrender.com/applications/${applicationId}`,
        {
          status: 'hired',
        }
      )
      .subscribe({
        next: () => {
          this.loadJobPosts();
          this.showToast('Candidate is hired.', 'success');
        },
        error: () => this.showToast('Failed to hire candidate', 'danger'),
      });
  }

  triggerDeleteJob(jobId: number) {
    this.openConfirmModal(
      'Delete Job Post',
      'Are you sure you want to delete this job post?',
      () => this.deleteJob(jobId)
    );
  }

  deleteJob(jobId: number) {
    this.http
      .delete(
        `https://job-tracker-backend-s1bg.onrender.com/job-posts/${jobId}`
      )
      .subscribe({
        next: () => {
          this.jobPosts = this.jobPosts.filter((job) => job.id !== jobId);
          this.showToast('Job post deleted.', 'success');
        },
        error: () => this.showToast('Failed to delete Job post.', 'danger'),
      });
  }

  showToast(message: string, type: 'success' | 'danger' = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;
    document.getElementById('toastZone')?.appendChild(toast);
    new bootstrap.Toast(toast).show();
  }
  openConfirmModal(title: string, message: string, action: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalAction = action;

    const modalEl = document.getElementById('confirmModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  handleModalConfirm() {
    if (this.modalAction) {
      this.modalAction();
      this.modalAction = null;

      const modalEl = document.getElementById('confirmModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
    }
  }
  openEditModal(job: any) {
    this.editJob = { ...job };

    const modalEl = document.getElementById('editJobModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  submitJobEdit() {
    this.http
      .patch(
        `https://job-tracker-backend-s1bg.onrender.com/job-posts/${this.editJob.id}`,
        this.editJob
      )
      .subscribe({
        next: () => {
          this.loadJobPosts();
          this.showToast('Job post updated!', 'success');

          const modalEl = document.getElementById('editJobModal');
          const modal = bootstrap.Modal.getInstance(modalEl!);
          modal?.hide();
        },
        error: () => this.showToast('Failed to update job post', 'danger'),
      });
  }
}
