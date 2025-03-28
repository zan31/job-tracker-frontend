import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

declare var bootstrap: any;

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
  modalTitle = '';
  modalMessage = '';
  modalAction: (() => void) | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

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
      .subscribe(() => this.showToast('Profile updated!', 'success'));
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
                        this.showToast('CV uploaded and saved!', 'success');
                      });
                  });
              },
              error: () => this.showToast('Failed to upload to S3', 'danger'),
            });
        },
        error: () => this.showToast('Failed to get presigned URL', 'danger'),
      });
  }

  openWithdrawModal(applicationId: number) {
    this.openConfirmModal(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      () => this.withdraw(applicationId)
    );
  }

  withdraw(applicationId: number) {
    this.http
      .delete(`http://localhost:3000/applications/${applicationId}`)
      .subscribe({
        next: () => {
          this.applications = this.applications.filter(
            (app) => app.id !== applicationId
          );
          this.showToast('Application withdrawn', 'success');
        },
        error: () => this.showToast('Failed to withdraw', 'danger'),
      });
  }

  triggerDeleteAccount() {
    this.openConfirmModal(
      'Delete Account',
      'Are you sure you want to permanently delete your account?',
      () => this.deleteAccount()
    );
  }

  deleteAccount() {
    this.http.delete('http://localhost:3000/users/me').subscribe({
      next: () => {
        this.auth.logout();
        this.showToast('Your account has been deleted.', 'success');
        location.href = '/login';
      },
      error: () => this.showToast('Failed to delete account', 'danger'),
    });
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
}
