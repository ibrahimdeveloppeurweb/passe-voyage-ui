import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent {
  users = [
    { name: 'Kouassi Marc', email: 'marc@passevoyage.ci', role: 'Super Admin', status: 'Actif', date: '2026-08-10' },
    { name: 'Touré Awa', email: 'awa@passevoyage.ci', role: 'Finance', status: 'Actif', date: '2026-08-11' },
    { name: 'Bamba Souleymane', email: 'souleymane@passevoyage.ci', role: 'Manager Terrain', status: 'Inactif', date: '2026-08-01' },
  ];

  newUser = {
    name: '',
    email: '',
    role: 'Manager Terrain',
    status: 'Actif',
    date: new Date().toISOString().split('T')[0]
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveUser();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveUser() {
    if (this.newUser.name.trim() && this.newUser.email.trim()) {
      this.users.unshift({ ...this.newUser });
      // Reset
      this.newUser = {
        name: '',
        email: '',
        role: 'Manager Terrain',
        status: 'Actif',
        date: new Date().toISOString().split('T')[0]
      };
    }
  }
}
