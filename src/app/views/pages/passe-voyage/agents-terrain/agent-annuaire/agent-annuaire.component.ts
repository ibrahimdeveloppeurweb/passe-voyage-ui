import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-annuaire',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './agent-annuaire.component.html',
  styleUrl: './agent-annuaire.component.scss'
})
export class AgentAnnuaireComponent {
  agents = [
    { matricule: 'AG-001', nom: 'Koffi Yao', telephone: '01 02 03 04 05', statut: 'Actif' },
    { matricule: 'AG-002', nom: 'Sanogo Moussa', telephone: '05 06 07 08 09', statut: 'En Congé' },
    { matricule: 'AG-003', nom: 'Ouattara Fatou', telephone: '07 08 09 10 11', statut: 'Actif' },
  ];

  newAgent = {
    nom: '',
    telephone: '',
    statut: 'Actif'
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveAgent();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveAgent() {
    if (this.newAgent.nom.trim() && this.newAgent.telephone.trim()) {
      const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.agents.push({
        matricule: 'AG-' + randomId,
        ...this.newAgent
      });
      this.newAgent = {
        nom: '',
        telephone: '',
        statut: 'Actif'
      };
    }
  }
}
