import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pass-base',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './pass-base.component.html',
  styleUrl: './pass-base.component.scss'
})
export class PassBaseComponent {
  passagers = [
    { id: 'PS-1045', nom: 'Diallo Amadou', telephone: '07 88 99 00 11', solde: 5000, statut: 'Actif', inscription: '2026-01-15' },
    { id: 'PS-1046', nom: 'Kouassi Marie', telephone: '05 11 22 33 44', solde: 0, statut: 'Actif', inscription: '2026-03-22' },
    { id: 'PS-1047', nom: 'Bamba Ali', telephone: '01 55 66 77 88', solde: -2000, statut: 'Bloqué', inscription: '2026-05-10' },
  ];

  newPassager = {
    nom: '',
    telephone: ''
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.savePassager();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  savePassager() {
    if (this.newPassager.nom.trim() && this.newPassager.telephone.trim()) {
      const randomId = Math.floor(Math.random() * 9000 + 1000).toString();
      this.passagers.unshift({
        id: 'PS-' + randomId,
        nom: this.newPassager.nom,
        telephone: this.newPassager.telephone,
        solde: 0,
        statut: 'Actif',
        inscription: new Date().toISOString().split('T')[0]
      });
      this.newPassager = { nom: '', telephone: '' };
    }
  }
}
