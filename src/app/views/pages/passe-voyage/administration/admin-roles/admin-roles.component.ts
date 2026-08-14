import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.scss'
})
export class AdminRolesComponent {
  roles = [
    { name: 'Super Admin', desc: 'Accès total à tous les modules du backoffice.', usersCount: 2 },
    { name: 'Finance', desc: 'Gestion des crédits, recouvrements et paiements.', usersCount: 3 },
    { name: 'Manager Terrain', desc: 'Suivi des agents terrain et statistiques globales.', usersCount: 5 },
  ];

  newRoleName = '';
  newRoleDesc = '';

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveRole();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveRole() {
    if (this.newRoleName.trim()) {
      this.roles.push({
        name: this.newRoleName,
        desc: this.newRoleDesc,
        usersCount: 0
      });
      // Reset
      this.newRoleName = '';
      this.newRoleDesc = '';
    }
  }
}
