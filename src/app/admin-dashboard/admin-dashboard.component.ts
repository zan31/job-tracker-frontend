import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  companies: any[] = [];
  jobPosts: any[] = [];
  applications: any[] = [];
  editingCompany: any = null;
  isNewCompany = false;
  deleteCompanyId: number | null = null;
  deleteApplicationId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  openDeleteApplicationModal(id: number) {
    this.deleteApplicationId = id;
    this.showModal('deleteApplicationModal');
  }

  confirmDeleteApplication() {
    if (!this.deleteApplicationId) return;

    this.http
      .delete(
        `http://localhost:3000/applications/admin/${this.deleteApplicationId}`
      )
      .subscribe({
        next: () => {
          this.showToast('Application deleted', 'success');
          this.loadAllData();
          this.hideModal('deleteApplicationModal');
        },
        error: () => this.showToast('Failed to delete application', 'danger'),
      });
  }

  openEditCompany(company: any) {
    this.isNewCompany = false;
    this.editingCompany = { ...company };
    this.showModal('companyModal');
  }

  openNewCompanyModal() {
    this.isNewCompany = true;
    this.editingCompany = { name: '', website: '', description: '' };
    this.showModal('companyModal');
  }

  submitCompanyForm() {
    const data = this.editingCompany;
    const url =
      'http://localhost:3000/companies' +
      (this.isNewCompany ? '' : `/${data.id}`);
    const method = this.isNewCompany ? this.http.post : this.http.put;

    method.call(this.http, url, data).subscribe({
      next: () => {
        this.showToast(
          this.isNewCompany ? 'Company created' : 'Company updated',
          'success'
        );
        this.loadAllData();
        this.hideModal('companyModal');
      },
      error: () => this.showToast('Failed to save company', 'danger'),
    });
  }

  openDeleteCompanyModal(id: number) {
    this.deleteCompanyId = id;
    this.showModal('deleteConfirmModal');
  }

  confirmDeleteCompany() {
    if (!this.deleteCompanyId) return;

    this.http
      .delete(`http://localhost:3000/companies/${this.deleteCompanyId}`)
      .subscribe({
        next: () => {
          this.showToast('Company deleted', 'success');
          this.loadAllData();
          this.hideModal('deleteConfirmModal');
        },
        error: () => this.showToast('Delete failed', 'danger'),
      });
  }

  showModal(id: string) {
    const el = document.getElementById(id);
    if (el) new bootstrap.Modal(el).show();
  }

  hideModal(id: string) {
    const el = document.getElementById(id);
    const modal = bootstrap.Modal.getInstance(el!);
    modal?.hide();
  }

  loadAllData() {
    this.http
      .get<any[]>('http://localhost:3000/users')
      .subscribe((data) => (this.users = data));
    this.http
      .get<any[]>('http://localhost:3000/companies')
      .subscribe((data) => (this.companies = data));
    this.http
      .get<any[]>('http://localhost:3000/job-posts')
      .subscribe((data) => (this.jobPosts = data));
    this.http
      .get<any[]>('http://localhost:3000/applications')
      .subscribe((data) => (this.applications = data));
  }

  deleteEntity(type: string, id: number) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    this.http.delete(`http://localhost:3000/${type}/${id}`).subscribe(() => {
      this.loadAllData();
      alert(`${type} deleted successfully.`);
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
}
