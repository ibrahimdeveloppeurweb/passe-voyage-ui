import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ref-tarifs',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './ref-tarifs.component.html',
  styleUrl: './ref-tarifs.component.scss'
})
export class RefTarifsComponent {
  tarifs = [
    { trajet: 'Abidjan - Yamoussoukro', compagnie: 'Toutes', prixBase: 4000 },
    { trajet: 'Abidjan - Bouaké', compagnie: 'Toutes', prixBase: 5000 },
    { trajet: 'Bouaké - Korhogo', compagnie: 'UTB', prixBase: 3500 },
  ];

  newTarif = {
    trajet: '',
    compagnie: 'Toutes',
    prixBase: 0
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveTarif();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveTarif() {
    if (this.newTarif.trajet.trim() && this.newTarif.prixBase > 0) {
      this.tarifs.push({ ...this.newTarif });
      this.newTarif = {
        trajet: '',
        compagnie: 'Toutes',
        prixBase: 0
      };
    }
  }
}
