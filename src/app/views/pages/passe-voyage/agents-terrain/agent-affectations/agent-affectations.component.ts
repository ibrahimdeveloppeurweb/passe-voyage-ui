import { Component, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-affectations',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './agent-affectations.component.html',
  styleUrl: './agent-affectations.component.scss'
})
export class AgentAffectationsComponent {
  affectations = [
    { agent: 'Koffi Yao (AG-001)', lieu: 'Gare Adjamé Renault', date: '2026-08-13', heureDebut: '06:00', heureFin: '14:00' },
    { agent: 'Ouattara Fatou (AG-003)', lieu: 'Gare Principale Yakro', date: '2026-08-13', heureDebut: '08:00', heureFin: '17:00' },
  ];

  newAffectation = {
    agent: '',
    lieu: '',
    date: new Date().toISOString().split('T')[0],
    heureDebut: '08:00',
    heureFin: '17:00'
  };

  constructor(private modalService: NgbModal) {}

  openModal(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true }).result.then((result) => {
      if (result === 'save') {
        this.saveAffectation();
      }
    }, (reason) => {
      // Modal dismissed
    });
  }

  saveAffectation() {
    if (this.newAffectation.agent && this.newAffectation.lieu) {
      this.affectations.unshift({ ...this.newAffectation });
      this.newAffectation = {
        agent: '',
        lieu: '',
        date: new Date().toISOString().split('T')[0],
        heureDebut: '08:00',
        heureFin: '17:00'
      };
    }
  }
}
