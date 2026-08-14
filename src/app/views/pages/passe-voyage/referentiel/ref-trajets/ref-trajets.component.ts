import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ref-trajets',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './ref-trajets.component.html',
  styleUrl: './ref-trajets.component.scss'
})
export class RefTrajetsComponent {
  trajets = [
    { depart: 'Abidjan', arrivee: 'Yamoussoukro', distance: '240 km', statut: 'Actif' },
    { depart: 'Abidjan', arrivee: 'Bouaké', distance: '350 km', statut: 'Actif' },
    { depart: 'Bouaké', arrivee: 'Korhogo', distance: '220 km', statut: 'Actif' },
  ];

  newTrajet = {
    depart: '',
    arrivee: '',
    distance: '',
    statut: 'Actif'
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveTrajet();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveTrajet() {
    if (this.newTrajet.depart.trim() && this.newTrajet.arrivee.trim()) {
      this.trajets.push({ ...this.newTrajet });
      this.newTrajet = {
        depart: '',
        arrivee: '',
        distance: '',
        statut: 'Actif'
      };
    }
  }
}
