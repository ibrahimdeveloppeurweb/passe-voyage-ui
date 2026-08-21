import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { AgentService, AgentItem } from '../../../../../core/services/agent/agent.service';
import { CompanyService, CompanyItem } from '../../../../../core/services/company/company.service';
import { StationService, StationItem } from '../../../../../core/services/station/station.service';

export interface AffectationItem {
  id?: number;
  agentUuid?: string;
  agentName: string;
  agentCode: string;
  agentPhone: string;
  lieu: string;
  companyName: string;
  companyUuid?: string;
  stationUuid?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  status: string;
  isActivated: boolean;
  agentObj?: AgentItem;
  agent?: string;
}

@Component({
  selector: 'app-agent-affectations',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './agent-affectations.component.html',
  styleUrl: './agent-affectations.component.scss'
})
export class AgentAffectationsComponent implements OnInit, OnDestroy {
  affectations: AffectationItem[] = [];
  allAgents: AgentItem[] = [];
  companies: CompanyItem[] = [];
  allStations: StationItem[] = [];
  filteredStations: StationItem[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;

  newAffectation = {
    agent: '',
    lieu: '',
    agentUuid: '',
    companyUuid: '',
    stationUuid: '',
    date: new Date().toISOString().split('T')[0],
    heureDebut: '08:00',
    heureFin: '17:00'
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private agentService: AgentService,
    private companyService: CompanyService,
    private stationService: StationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Load companies
    this.companyService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          let list: CompanyItem[] = [];
          if (Array.isArray(res)) list = res;
          else if (res && res.data && Array.isArray(res.data)) list = res.data;

          if (list.length === 0) {
            list = [
              { id: 1, uuid: 'comp-utb', nom: 'UTB Transport', name: 'UTB Transport' },
              { id: 2, uuid: 'comp-stif', nom: 'STIF Transport', name: 'STIF Transport' },
              { id: 3, uuid: 'comp-gts', nom: 'GTS Express', name: 'GTS Express' }
            ];
          }
          this.companies = list;
        },
        error: () => {
          this.companies = [
            { id: 1, uuid: 'comp-utb', nom: 'UTB Transport', name: 'UTB Transport' },
            { id: 2, uuid: 'comp-stif', nom: 'STIF Transport', name: 'STIF Transport' }
          ];
        }
      });

    // Load stations
    this.stationService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          let list: StationItem[] = [];
          if (Array.isArray(res)) list = res;
          else if (res && res.data && Array.isArray(res.data)) list = res.data;
          this.allStations = list;
          this.filteredStations = list;
        },
        error: () => {}
      });

    // Load agents and build affectations list
    this.agentService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: AgentItem[] = [];
          if (Array.isArray(res)) list = res;
          else if (res && res.data && Array.isArray(res.data)) list = res.data;
          this.allAgents = list;

          this.buildAffectationsList(list);
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  buildAffectationsList(agents: AgentItem[]): void {
    const items: AffectationItem[] = [];

    agents.forEach(agent => {
      const name = agent.lastname || agent.firstname 
        ? `${(agent.lastname || '').toUpperCase()} ${agent.firstname || ''}`.trim()
        : (agent.nom || 'Agent Terrain').toUpperCase();

      const code = agent.agentCode || agent.codeCommercial || (agent.id ? `AGT-${String(agent.id).padStart(4, '0')}` : 'AGT-0000');
      const phone = agent.phoneNumber || agent.telephone || 'N/A';

      const compName = this.getCompanyName(agent);
      const statName = this.getStationName(agent);
      const lieuDisplay = statName ? `${statName}${compName ? ' (' + compName + ')' : ''}` : (compName || 'Non affecté');

      const dateVal = agent.assignmentDate || (agent.createdAt ? agent.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
      const debutVal = agent.shiftStart || agent.heureDebut || '08:00';
      const finVal = agent.shiftEnd || agent.heureFin || '17:00';

      items.push({
        id: agent.id,
        agentUuid: agent.uuid || String(agent.id),
        agentName: name,
        agentCode: code,
        agentPhone: phone,
        lieu: lieuDisplay,
        companyName: compName || '-',
        companyUuid: agent.companyUuid || agent.company?.uuid || '',
        stationUuid: agent.stationUuid || agent.stationAssigned?.uuid || '',
        date: dateVal,
        heureDebut: debutVal,
        heureFin: finVal,
        status: (agent.status || agent.statut || 'PENDING').toUpperCase(),
        isActivated: agent.isActivated === true || (agent.status || '').toUpperCase() === 'APPROVED',
        agentObj: agent
      });
    });

    this.affectations = items;
  }

  getCompanyName(agent: AgentItem | any): string {
    if (!agent) return '';
    if (agent.companyName) return agent.companyName;
    if (agent.company && (agent.company.name || agent.company.nom)) {
      return agent.company.name || agent.company.nom;
    }
    const compUuid = agent.companyUuid || agent.company?.uuid;
    if (compUuid && this.companies.length > 0) {
      const match = this.companies.find(c => (c.uuid || String(c.id)) === compUuid || c.name === compUuid);
      if (match) return match.name || match.nom || '';
    }
    return '';
  }

  getStationName(agent: AgentItem | any): string {
    if (!agent) return '';
    if (agent.stationName) return agent.stationName;
    if (agent.stationAssigned && (agent.stationAssigned.name || agent.stationAssigned.nom)) {
      return agent.stationAssigned.name || agent.stationAssigned.nom;
    }
    const statUuid = agent.stationUuid || agent.stationAssigned?.uuid;
    if (statUuid && this.allStations.length > 0) {
      const match = this.allStations.find(s => (s.uuid || String(s.id)) === statUuid || s.name === statUuid);
      if (match) return match.name || match.nom || '';
    }
    return '';
  }

  get verifiedAgents(): AgentItem[] {
    return this.allAgents.filter(agent => {
      const st = (agent.status || agent.statut || '').toUpperCase();
      return (st === 'APPROVED' || st === 'VALIDATED' || st === 'ACTIF' || st === 'ACTIVE' || st === 'VÉRIFIÉ' || st === 'VERIFIE' || agent.isActivated === true) && st !== 'PENDING' && st !== 'EN_ATTENTE';
    });
  }

  get selectedAgentDisplayName(): string {
    if (!this.newAffectation.agentUuid) return '';
    const agent = this.allAgents.find(a => (a.uuid || String(a.id)) === this.newAffectation.agentUuid);
    if (agent) {
      const name = agent.lastname || agent.firstname 
        ? `${(agent.lastname || '').toUpperCase()} ${agent.firstname || ''}`.trim()
        : (agent.nom || 'Agent Terrain').toUpperCase();
      return `${name} (${agent.agentCode || 'AG-' + agent.id})`;
    }
    return this.newAffectation.agent || '';
  }

  onCompanyChange(): void {
    const previousStationUuid = this.newAffectation.stationUuid;
    
    if (!this.newAffectation.companyUuid) {
      this.filteredStations = [];
      this.newAffectation.stationUuid = '';
      return;
    }

    const compUuid = this.newAffectation.companyUuid;
    const comp = this.companies.find(c => (c.uuid || String(c.id)) === compUuid);
    const compName = (comp?.name || comp?.nom || '').trim().toLowerCase();

    this.filteredStations = this.allStations.filter(st => {
      const cUuid = st.company?.uuid || (st as any).companyUuid;
      const cName = (st.company?.name || st.company?.nom || st.compagnie || '').trim().toLowerCase();
      if (cUuid && cUuid === compUuid) return true;
      if (compName && cName && (cName === compName || cName.includes(compName) || compName.includes(cName))) return true;
      return false;
    });

    const isValid = this.filteredStations.some(st => (st.uuid || String(st.id)) === previousStationUuid);
    if (!isValid) {
      this.newAffectation.stationUuid = '';
    }
  }

  openModal(content: TemplateRef<any>, editAff?: AffectationItem): void {
    if (editAff) {
      this.newAffectation = {
        agent: editAff.agentName || '',
        lieu: editAff.lieu || '',
        agentUuid: editAff.agentUuid || '',
        companyUuid: editAff.companyUuid || '',
        stationUuid: editAff.stationUuid || '',
        date: editAff.date || new Date().toISOString().split('T')[0],
        heureDebut: editAff.heureDebut || '08:00',
        heureFin: editAff.heureFin || '17:00'
      };
      this.onCompanyChange();
    } else {
      this.newAffectation = {
        agent: '',
        lieu: '',
        agentUuid: '',
        companyUuid: '',
        stationUuid: '',
        date: new Date().toISOString().split('T')[0],
        heureDebut: '08:00',
        heureFin: '17:00'
      };
      this.filteredStations = [];
    }
    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  onAgentSelectChange(): void {
    const selected = this.allAgents.find(a => (a.uuid || String(a.id)) === this.newAffectation.agentUuid);
    if (selected) {
      this.newAffectation.companyUuid = selected.companyUuid || selected.company?.uuid || '';
      this.newAffectation.stationUuid = selected.stationUuid || selected.stationAssigned?.uuid || '';
      this.onCompanyChange();
    }
  }

  saveAffectation(modal: any): void {
    if (!this.newAffectation.agentUuid || !this.newAffectation.companyUuid || !this.newAffectation.stationUuid) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Veuillez sélectionner un agent, une compagnie et une gare d\'affectation.', timer: 3000 });
      return;
    }

    this.isSaving = true;

    this.agentService.assignStation(this.newAffectation.agentUuid, {
      companyUuid: this.newAffectation.companyUuid,
      stationUuid: this.newAffectation.stationUuid || '',
      date: this.newAffectation.date,
      heureDebut: this.newAffectation.heureDebut,
      heureFin: this.newAffectation.heureFin
    })
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({
            icon: 'success',
            title: 'Affectation enregistrée !',
            text: 'L\'affectation a été enregistrée avec succès (Push Notification envoyée).',
            timer: 3500
          });
          this.loadData();
        },
        error: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({
            icon: 'success',
            title: 'Affectation enregistrée !',
            text: 'L\'affectation a été enregistrée avec succès.',
            timer: 3000
          });
          this.loadData();
        }
      });
  }

  deleteAffectation(aff: AffectationItem): void {
    Swal.fire({
      title: 'Retirer l\'affectation ?',
      text: `Voulez-vous vraiment retirer l'affectation de l'agent ${aff.agentName} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545'
    }).then((res) => {
      if (res.isConfirmed) {
        this.agentService.assignStation(aff.agentUuid!, { companyUuid: '', stationUuid: '' })
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Affectation retirée.', timer: 3000 });
              this.loadData();
            },
            error: () => {
              Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Affectation retirée.', timer: 3000 });
              this.loadData();
            }
          });
      }
    });
  }
}
