import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ref-gares',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './ref-gares.component.html',
  styleUrl: './ref-gares.component.scss'
})
export class RefGaresComponent {
  gares = [
    { ville: 'Abidjan', nom: 'Gare Adjamé Renault', compagnie: 'UTB', statut: 'Actif' },
    { ville: 'Bouaké', nom: 'Gare Routière de Bouaké', compagnie: 'UTB', statut: 'Actif' },
    { ville: 'Yamoussoukro', nom: 'Gare Principale Yakro', compagnie: 'Toutes', statut: 'Actif' },
  ];

  newGare = {
    ville: '',
    nom: '',
    compagnie: 'Toutes',
    statut: 'Actif'
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveGare();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveGare() {
    if (this.newGare.ville.trim() && this.newGare.nom.trim()) {
      this.gares.push({ ...this.newGare });
      this.newGare = {
        ville: '',
        nom: '',
        compagnie: 'Toutes',
        statut: 'Actif'
      };
    }
  }
}
