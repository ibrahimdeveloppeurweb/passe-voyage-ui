import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rec-paiements',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './rec-paiements.component.html',
  styleUrl: './rec-paiements.component.scss'
})
export class RecPaiementsComponent {
  paiements = [
    { ref: 'PMT-001', passager: 'Sanogo Moussa (PS-0912)', montant: 3500, date: '2026-08-12 10:30', methode: 'Mobile Money', statut: 'Validé' },
    { ref: 'PMT-002', passager: 'Diallo Amadou (PS-1045)', montant: 4000, date: '2026-08-13 09:15', methode: 'Espèces (Gare)', statut: 'Validé' },
  ];

  newPaiement = {
    passager: '',
    montant: 0,
    methode: 'Espèces (Gare)'
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.savePaiement();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  savePaiement() {
    if (this.newPaiement.passager && this.newPaiement.montant > 0) {
      const randomId = Math.floor(Math.random() * 900 + 100).toString();
      this.paiements.unshift({
        ref: 'PMT-' + randomId,
        passager: this.newPaiement.passager,
        montant: this.newPaiement.montant,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        methode: this.newPaiement.methode,
        statut: 'Validé'
      });
      this.newPaiement = { passager: '', montant: 0, methode: 'Espèces (Gare)' };
    }
  }
}
