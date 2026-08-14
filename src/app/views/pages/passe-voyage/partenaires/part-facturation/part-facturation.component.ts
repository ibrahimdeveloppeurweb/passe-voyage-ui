import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-part-facturation',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './part-facturation.component.html',
  styleUrl: './part-facturation.component.scss'
})
export class PartFacturationComponent {
  factures = [
    { reference: 'FAC-2026-08-001', compagnie: 'UTB', periode: 'Août 2026', montant: 1500000, statut: 'En attente' },
    { reference: 'FAC-2026-07-042', compagnie: 'UTB', periode: 'Juillet 2026', montant: 2100000, statut: 'Payé' },
    { reference: 'FAC-2026-07-045', compagnie: 'MT', periode: 'Juillet 2026', montant: 850000, statut: 'Payé' },
  ];

  newFacture = {
    reference: '',
    compagnie: 'UTB',
    periode: '',
    montant: 0,
    statut: 'En attente'
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveFacture();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveFacture() {
    if (this.newFacture.periode.trim() && this.newFacture.montant > 0) {
      // Auto-generate reference for demo
      this.newFacture.reference = 'FAC-2026-08-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.factures.unshift({ ...this.newFacture });
      this.newFacture = {
        reference: '',
        compagnie: 'UTB',
        periode: '',
        montant: 0,
        statut: 'En attente'
      };
    }
  }
}
