import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agent-performances',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-performances.component.html',
  styleUrl: './agent-performances.component.scss'
})
export class AgentPerformancesComponent {
  performances = [
    { agent: 'Koffi Yao (AG-001)', gare: 'Gare Adjamé Renault', validations: 145, ventesPhysiques: 45000, statut: 'Excellent' },
    { agent: 'Sanogo Moussa (AG-002)', gare: 'Gare Routière de Bouaké', validations: 89, ventesPhysiques: 15000, statut: 'Moyen' },
    { agent: 'Ouattara Fatou (AG-003)', gare: 'Gare Principale Yakro', validations: 120, ventesPhysiques: 25000, statut: 'Bon' },
  ];
}
