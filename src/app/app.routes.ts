import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth/auth.guard';
import { JobBoardComponent } from './job-board/job-board.component';
import { CreateJobComponent } from './create-job/create-job.component';
import { RecruiterDashboardComponent } from './recruiter-dashboard/recruiter-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'recruiter-dashboard',
    component: RecruiterDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'jobs', component: JobBoardComponent, canActivate: [AuthGuard] },
  {
    path: 'jobs/create',
    component: CreateJobComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'login' },
];
