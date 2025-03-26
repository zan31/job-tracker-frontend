import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [FormsModule, RouterModule],
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.auth
      .register(this.fullName, this.email, this.password)
      .subscribe(() => {
        this.router.navigate(['/dashboard']);
      });
  }
}
