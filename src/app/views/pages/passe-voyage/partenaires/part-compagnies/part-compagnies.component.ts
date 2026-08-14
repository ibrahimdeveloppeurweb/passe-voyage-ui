import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-part-compagnies',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './part-compagnies.component.html',
  styleUrl: './part-compagnies.component.scss'
})
export class PartCompagniesComponent {
  compagnies = [
    { nom: 'UTB', contact: 'contact@utb.ci', telephone: '01 02 03 04 05', statut: 'Partenaire Principal' },
    { nom: 'MT', contact: 'contact@mt.ci', telephone: '05 06 07 08 09', statut: 'Partenaire Actif' },
  ];

  newCompagnie = {
    nom: '',
    contact: '',
    telephone: '',
    statut: 'Partenaire Actif'
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveCompagnie();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveCompagnie() {
    if (this.newCompagnie.nom.trim()) {
      this.compagnies.push({ ...this.newCompagnie });
      this.newCompagnie = {
        nom: '',
        contact: '',
        telephone: '',
        statut: 'Partenaire Actif'
      };
    }
  }
}
