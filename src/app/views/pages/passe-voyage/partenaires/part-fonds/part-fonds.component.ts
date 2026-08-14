import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-part-fonds',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './part-fonds.component.html',
  styleUrl: './part-fonds.component.scss'
})
export class PartFondsComponent {
  fonds = [
    { compagnie: 'UTB', totalFonds: 10000000, consomme: 2500000, reste: 7500000, pourcentage: 25, statut: 'Normal' },
    { compagnie: 'MT', totalFonds: 5000000, consomme: 4500000, reste: 500000, pourcentage: 90, statut: 'Critique' },
  ];

  newFond = {
    compagnie: '',
    montant: 0
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveFond();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveFond() {
    if (this.newFond.compagnie.trim() && this.newFond.montant > 0) {
      this.fonds.unshift({
        compagnie: this.newFond.compagnie,
        totalFonds: this.newFond.montant,
        consomme: 0,
        reste: this.newFond.montant,
        pourcentage: 0,
        statut: 'Normal'
      });
      // Reset
      this.newFond = { compagnie: '', montant: 0 };
    }
  }
}
