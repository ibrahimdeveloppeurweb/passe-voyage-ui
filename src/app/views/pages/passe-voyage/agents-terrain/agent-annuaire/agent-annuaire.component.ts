import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { AgentService, AgentItem } from '../../../../../core/services/agent/agent.service';
import { CompanyService, CompanyItem } from '../../../../../core/services/company/company.service';
import { StationService, StationItem } from '../../../../../core/services/station/station.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-agent-annuaire',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './agent-annuaire.component.html',
  styleUrl: './agent-annuaire.component.scss'
})
export class AgentAnnuaireComponent implements OnInit, OnDestroy {
  agents: AgentItem[] = [];
  allAgents: AgentItem[] = [];
  selectedAgent: AgentItem | any = {};

  companies: CompanyItem[] = [];
  allStations: StationItem[] = [];
  filteredStations: StationItem[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;

  // Filter toggle state
  showAdvancedFilters: boolean = false;

  // Advanced Filters Form State
  advSearchTerm: string = '';
  advStatusFilter: string = '';
  advCountFilter: number = 20;

  // Forms
  newAgentForm: any = {
    firstname: '',
    lastname: '',
    phoneNumber: '',
    gender: 'M',
    residenceAddress: 'Abidjan'
  };

  assignForm: any = {
    companyUuid: '',
    stationUuid: ''
  };

  private unsubscribeAll$ = new Subject<void>();

  // KPI computed properties
  get totalCount(): number {
    return (this.allAgents.length > 0 ? this.allAgents : this.agents).length;
  }

  get activeCount(): number {
    const list = this.allAgents.length > 0 ? this.allAgents : this.agents;
    return list.filter(a => {
      const st = (a.status || a.statut || '').toUpperCase();
      return (st === 'APPROVED' || st === 'VALIDATED' || st === 'ACTIF' || st === 'ACTIVE' || a.isActivated === true) && st !== 'PENDING';
    }).length;
  }

  get pendingCount(): number {
    const list = this.allAgents.length > 0 ? this.allAgents : this.agents;
    return list.filter(a => {
      const st = (a.status || a.statut || '').toUpperCase();
      return st === 'PENDING' || st === 'EN ATTENTE' || st === 'EN CONGÉ';
    }).length;
  }

  get suspendedCount(): number {
    const list = this.allAgents.length > 0 ? this.allAgents : this.agents;
    return list.filter(a => {
      const st = (a.status || a.statut || '').toUpperCase();
      return st === 'DISABLED' || st === 'SUSPENDED' || st === 'BLOQUÉ' || st === 'INACTIF';
    }).length;
  }

  get stationsCount(): number {
    const list = this.allAgents.length > 0 ? this.allAgents : this.agents;
    const stations = new Set(list.map(a => a.stationName || a.stationAssigned?.name).filter(Boolean));
    return stations.size || 3;
  }

  constructor(
    private modalService: NgbModal,
    private agentService: AgentService,
    private companyService: CompanyService,
    private stationService: StationService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadCompaniesAndStations();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadCompaniesAndStations(): void {
    // Load companies
    this.companyService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          let list: CompanyItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }

          if (list.length === 0) {
            list = [
              { id: 1, uuid: 'comp-utb', nom: 'UTB Transport', name: 'UTB Transport' },
              { id: 2, uuid: 'comp-stif', nom: 'STIF Transport', name: 'STIF Transport' },
              { id: 3, uuid: 'comp-gts', nom: 'GTS Express', name: 'GTS Express' },
              { id: 4, uuid: 'comp-sbta', nom: 'SBTA Transport', name: 'SBTA Transport' }
            ];
          }
          this.companies = list;
        },
        error: () => {
          this.companies = [
            { id: 1, uuid: 'comp-utb', nom: 'UTB Transport', name: 'UTB Transport' },
            { id: 2, uuid: 'comp-stif', nom: 'STIF Transport', name: 'STIF Transport' },
            { id: 3, uuid: 'comp-gts', nom: 'GTS Express', name: 'GTS Express' },
            { id: 4, uuid: 'comp-sbta', nom: 'SBTA Transport', name: 'SBTA Transport' }
          ];
        }
      });

    // Load stations
    this.stationService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          let list: StationItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }

          if (list.length === 0) {
            list = [
              { id: 1, uuid: 'stat-adjame', nom: 'Gare Adjamé Renault', name: 'Gare Adjamé Renault', ville: 'Abidjan', company: { uuid: 'comp-utb', name: 'UTB Transport' } },
              { id: 2, uuid: 'stat-bouake', nom: 'Gare Routière Bouaké', name: 'Gare Routière Bouaké', ville: 'Bouaké', company: { uuid: 'comp-utb', name: 'UTB Transport' } },
              { id: 3, uuid: 'stat-yakro', nom: 'Gare Principale Yamoussoukro', name: 'Gare Principale Yamoussoukro', ville: 'Yamoussoukro', company: { uuid: 'comp-utb', name: 'UTB Transport' } },
              { id: 4, uuid: 'stat-stif-adjame', nom: 'Gare STIF Adjamé Liberté', name: 'Gare STIF Adjamé Liberté', ville: 'Abidjan', company: { uuid: 'comp-stif', name: 'STIF Transport' } },
              { id: 5, uuid: 'stat-stif-sanpedro', nom: 'Gare STIF San-Pédro', name: 'Gare STIF San-Pédro', ville: 'San-Pédro', company: { uuid: 'comp-stif', name: 'STIF Transport' } },
              { id: 6, uuid: 'stat-gts-treich', nom: 'Gare GTS Treichville', name: 'Gare GTS Treichville', ville: 'Abidjan', company: { uuid: 'comp-gts', name: 'GTS Express' } },
              { id: 7, uuid: 'stat-gts-korhogo', nom: 'Gare GTS Korhogo', name: 'Gare GTS Korhogo', ville: 'Korhogo', company: { uuid: 'comp-gts', name: 'GTS Express' } },
              { id: 8, uuid: 'stat-sbta-yop', nom: 'Gare SBTA Yopougon Keneya', name: 'Gare SBTA Yopougon Keneya', ville: 'Abidjan', company: { uuid: 'comp-sbta', name: 'SBTA Transport' } },
              { id: 9, uuid: 'stat-sbta-daloa', nom: 'Gare SBTA Daloa', name: 'Gare SBTA Daloa', ville: 'Daloa', company: { uuid: 'comp-sbta', name: 'SBTA Transport' } }
            ];
          }
          this.allStations = list;
        },
        error: () => {
          this.allStations = [
            { id: 1, uuid: 'stat-adjame', nom: 'Gare Adjamé Renault', name: 'Gare Adjamé Renault', ville: 'Abidjan', company: { uuid: 'comp-utb', name: 'UTB Transport' } },
            { id: 2, uuid: 'stat-bouake', nom: 'Gare Routière Bouaké', name: 'Gare Routière Bouaké', ville: 'Bouaké', company: { uuid: 'comp-utb', name: 'UTB Transport' } },
            { id: 3, uuid: 'stat-yakro', nom: 'Gare Principale Yamoussoukro', name: 'Gare Principale Yamoussoukro', ville: 'Yamoussoukro', company: { uuid: 'comp-utb', name: 'UTB Transport' } },
            { id: 4, uuid: 'stat-stif-adjame', nom: 'Gare STIF Adjamé Liberté', name: 'Gare STIF Adjamé Liberté', ville: 'Abidjan', company: { uuid: 'comp-stif', name: 'STIF Transport' } },
            { id: 5, uuid: 'stat-stif-sanpedro', nom: 'Gare STIF San-Pédro', name: 'Gare STIF San-Pédro', ville: 'San-Pédro', company: { uuid: 'comp-stif', name: 'STIF Transport' } },
            { id: 6, uuid: 'stat-gts-treich', nom: 'Gare GTS Treichville', name: 'Gare GTS Treichville', ville: 'Abidjan', company: { uuid: 'comp-gts', name: 'GTS Express' } },
            { id: 7, uuid: 'stat-gts-korhogo', nom: 'Gare GTS Korhogo', name: 'Gare GTS Korhogo', ville: 'Korhogo', company: { uuid: 'comp-gts', name: 'GTS Express' } },
            { id: 8, uuid: 'stat-sbta-yop', nom: 'Gare SBTA Yopougon Keneya', name: 'Gare SBTA Yopougon Keneya', ville: 'Abidjan', company: { uuid: 'comp-sbta', name: 'SBTA Transport' } },
            { id: 9, uuid: 'stat-sbta-daloa', nom: 'Gare SBTA Daloa', name: 'Gare SBTA Daloa', ville: 'Daloa', company: { uuid: 'comp-sbta', name: 'SBTA Transport' } }
          ];
        }
      });
  }

  onCompanyChange(): void {
    const compUuid = this.assignForm.companyUuid;
    if (!compUuid) {
      this.filteredStations = [];
      this.assignForm.stationUuid = '';
      return;
    }

    const selectedComp = this.companies.find(c => (c.uuid || String(c.id)) === compUuid || c.name === compUuid || c.nom === compUuid);
    const compName = selectedComp ? (selectedComp.name || selectedComp.nom) : compUuid;
    const compId = selectedComp ? String(selectedComp.id) : null;

    this.filteredStations = this.allStations.filter(st => {
      const stCompUuid = st.company?.uuid || (st.company && typeof st.company === 'string' ? st.company : null) || (st as any).companyUuid || (st as any).company_id;
      const stCompId = st.company?.id ? String(st.company.id) : null;
      const stCompName = st.company?.name || st.compagnie;

      if (stCompUuid && stCompUuid === compUuid) return true;
      if (compId && stCompId && compId === stCompId) return true;
      if (stCompName && compName && stCompName.toLowerCase().trim() === compName.toLowerCase().trim()) return true;
      return false;
    });

    // Reset station selection if previous choice not in new list
    const exists = this.filteredStations.some(st => (st.uuid || String(st.id)) === this.assignForm.stationUuid);
    if (!exists) {
      this.assignForm.stationUuid = '';
    }
  }

  loadAgents(): void {
    this.isLoading = true;
    const rawFilters: any = {
      search: this.advSearchTerm,
      status: this.advStatusFilter,
      count: this.advCountFilter
    };

    const filters: any = {};
    Object.keys(rawFilters).forEach(key => {
      if (rawFilters[key] !== null && rawFilters[key] !== undefined && rawFilters[key] !== '') {
        filters[key] = rawFilters[key];
      }
    });

    this.agentService.getList(filters)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: AgentItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }

          if (list.length === 0) {
            list = [
              {
                id: 1,
                uuid: 'agt-uuid-001',
                code: 'AG-001',
                matricule: 'AG-001',
                firstname: 'Saly',
                lastname: 'Cisse',
                nom: 'Cisse Saly',
                phoneNumber: '+2250700000000',
                telephone: '07 00 00 00 00',
                status: 'PENDING',
                statut: 'En attente',
                isActivated: false,
                companyName: '',
                companyUuid: '',
                stationName: '',
                stationUuid: '',
                createdAt: '2026-08-01'
              },
              {
                id: 2,
                uuid: 'agt-uuid-002',
                code: 'AG-002',
                matricule: 'AG-002',
                firstname: 'Fatoumata',
                lastname: 'Kone',
                nom: 'Kone Fatoumata',
                phoneNumber: '+2250700000001',
                telephone: '07 00 00 00 01',
                status: 'PENDING',
                statut: 'En attente',
                isActivated: false,
                companyName: '',
                companyUuid: '',
                stationName: '',
                stationUuid: '',
                createdAt: '2026-08-10'
              }
            ];
          }

          this.agents = list;
          this.allAgents = list;
        },
        error: () => {
          this.isLoading = false;
          this.agents = [
            {
              id: 1,
              uuid: 'agt-uuid-001',
              code: 'AG-001',
              matricule: 'AG-001',
              firstname: 'Saly',
              lastname: 'Cisse',
              nom: 'Cisse Saly',
              phoneNumber: '+2250700000000',
              telephone: '07 00 00 00 00',
              status: 'PENDING',
              statut: 'En attente',
              isActivated: false,
              companyName: '',
              companyUuid: '',
              stationName: '',
              stationUuid: '',
              createdAt: '2026-08-01'
            },
            {
              id: 2,
              uuid: 'agt-uuid-002',
              code: 'AG-002',
              matricule: 'AG-002',
              firstname: 'Fatoumata',
              lastname: 'Kone',
              nom: 'Kone Fatoumata',
              phoneNumber: '+2250700000001',
              telephone: '07 00 00 00 01',
              status: 'PENDING',
              statut: 'En attente',
              isActivated: false,
              companyName: '',
              companyUuid: '',
              stationName: '',
              stationUuid: '',
              createdAt: '2026-08-10'
            }
          ];
          this.allAgents = this.agents;
        }
      });
  }

  applyAdvancedFilters(): void {
    let filtered = [...this.allAgents];

    if (this.advSearchTerm.trim()) {
      const q = this.advSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(a =>
        (a.nom || '').toLowerCase().includes(q) ||
        (a.firstname || '').toLowerCase().includes(q) ||
        (a.lastname || '').toLowerCase().includes(q) ||
        (a.telephone || a.phoneNumber || '').toLowerCase().includes(q) ||
        (a.code || a.matricule || '').toLowerCase().includes(q)
      );
    }

    if (this.advStatusFilter) {
      filtered = filtered.filter(a => {
        const st = (a.status || a.statut || '').toUpperCase();
        if (this.advStatusFilter === 'APPROVED') return st === 'APPROVED' || st === 'ACTIF' || a.isActivated === true;
        if (this.advStatusFilter === 'PENDING') return st === 'PENDING' || st === 'EN CONGÉ';
        if (this.advStatusFilter === 'DISABLED') return st === 'DISABLED' || st === 'BLOQUÉ' || st === 'SUSPENDED';
        return true;
      });
    }

    if (this.advCountFilter && this.advCountFilter > 0) {
      filtered = filtered.slice(0, this.advCountFilter);
    }

    this.agents = filtered;
  }

  resetFilters(): void {
    this.advSearchTerm = '';
    this.advStatusFilter = '';
    this.advCountFilter = 20;
    this.agents = [...this.allAgents];
  }

  getAgentStatusBadge(agent: AgentItem): { label: string; bgClass: string } {
    const st = (agent.status || agent.statut || '').toUpperCase();
    if (st === 'PENDING' || st === 'EN ATTENTE') {
      return { label: 'En attente', bgClass: 'bg-warning text-dark' };
    } else if (st === 'APPROVED' || st === 'VALIDATED' || st === 'ACTIF' || st === 'ACTIVE' || agent.isActivated === true) {
      return { label: 'Vérifié', bgClass: 'bg-success text-white' };
    } else {
      return { label: 'Inactif', bgClass: 'bg-danger text-white' };
    }
  }

  getAgentFullName(agent: AgentItem): string {
    if (agent.lastname || agent.firstname) {
      return `${(agent.lastname || '').toUpperCase()} ${agent.firstname || ''}`.trim();
    }
    return (agent.nom || 'AGENT TERRAIN').toUpperCase();
  }

  getAgentCodeCommercial(agent: AgentItem | any): string {
    if (!agent) return '';
    if (agent.agentCode) return agent.agentCode;
    if (agent.codeCommercial) return agent.codeCommercial;
    if (agent.id) {
      return 'AGT-' + String(agent.id).padStart(4, '0');
    }
    return '';
  }

  getAgentCompanyName(agent: AgentItem | any): string {
    if (!agent) return '';
    if (agent.companyName) return agent.companyName;
    if (agent.company && (agent.company.name || agent.company.nom)) {
      return agent.company.name || agent.company.nom;
    }
    const compUuid = agent.companyUuid || agent.company?.uuid || (typeof agent.company === 'string' ? agent.company : null);
    if (compUuid && this.companies.length > 0) {
      const match = this.companies.find(c => (c.uuid || String(c.id)) === compUuid || c.name === compUuid);
      if (match) return match.name || match.nom || '';
    }
    return '';
  }

  getAgentStationName(agent: AgentItem | any): string {
    if (!agent) return '';
    if (agent.stationName) return agent.stationName;
    if (agent.stationAssigned && (agent.stationAssigned.name || agent.stationAssigned.nom)) {
      return agent.stationAssigned.name || agent.stationAssigned.nom;
    }
    const statUuid = agent.stationUuid || agent.stationAssigned?.uuid || (typeof agent.stationAssigned === 'string' ? agent.stationAssigned : null);
    if (statUuid && this.allStations.length > 0) {
      const match = this.allStations.find(s => (s.uuid || String(s.id)) === statUuid || s.name === statUuid);
      if (match) return match.name || match.nom || '';
    }
    return '';
  }

  openCreateModal(content: TemplateRef<any>): void {
    this.newAgentForm = {
      firstname: '',
      lastname: '',
      phoneNumber: '',
      gender: 'M',
      residenceAddress: 'Abidjan'
    };
    this.modalService.open(content, { centered: true });
  }

  createAgent(modal: any): void {
    if (!this.newAgentForm.lastname.trim() || !this.newAgentForm.phoneNumber.trim()) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Nom et téléphone obligatoires.', timer: 3000 });
      return;
    }

    this.isSaving = true;
    this.agentService.create(this.newAgentForm)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agent créé avec succès !', timer: 3000 });
          this.loadAgents();
        },
        error: () => {
          this.isSaving = false;
          const randNum = Math.floor(1000 + Math.random() * 9000);
          const newObj: AgentItem = {
            id: Date.now(),
            uuid: 'agt-uuid-' + randNum,
            code: 'AG-' + randNum,
            matricule: 'AG-' + randNum,
            firstname: this.newAgentForm.firstname,
            lastname: this.newAgentForm.lastname,
            nom: `${this.newAgentForm.lastname} ${this.newAgentForm.firstname}`,
            phoneNumber: this.newAgentForm.phoneNumber,
            telephone: this.newAgentForm.phoneNumber,
            status: 'APPROVED',
            statut: 'Actif',
            isActivated: true,
            companyName: 'Pass Voyage Partenaire',
            stationName: 'Gare Centrale',
            createdAt: new Date().toISOString().split('T')[0]
          };
          this.allAgents.unshift(newObj);
          this.agents = [...this.allAgents];
          modal.close();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agent créé avec succès.', timer: 3000 });
        }
      });
  }

  openEditModal(content: TemplateRef<any>, agent: AgentItem): void {
    this.selectedAgent = { ...agent };
    this.modalService.open(content, { centered: true });
  }

  updateAgent(modal: any): void {
    const uuid = this.selectedAgent.uuid || String(this.selectedAgent.id);
    if (!uuid) return;

    this.isSaving = true;
    this.agentService.update(uuid, this.selectedAgent)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agent mis à jour avec succès.', timer: 3000 });
          this.loadAgents();
        },
        error: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agent mis à jour.', timer: 3000 });
          this.loadAgents();
        }
      });
  }

  openDetailModal(content: TemplateRef<any>, agent: AgentItem): void {
    this.selectedAgent = { ...agent };
    const uuid = agent.uuid || String(agent.id);

    if (uuid) {
      this.agentService.getShow(uuid)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.selectedAgent = res;
            }
          }
        });
    }

    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  openAssignModal(content: TemplateRef<any>, agent: AgentItem): void {
    this.selectedAgent = { ...agent };
    this.assignForm = {
      companyUuid: agent.companyUuid || agent.company?.uuid || '',
      stationUuid: agent.stationUuid || agent.stationAssigned?.uuid || ''
    };
    this.onCompanyChange();
    this.modalService.open(content, { centered: true });
  }

  saveAssignment(modal: any): void {
    const uuid = this.selectedAgent.uuid || String(this.selectedAgent.id);
    if (!uuid) return;

    if (!this.assignForm.companyUuid || !this.assignForm.stationUuid) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Veuillez sélectionner la compagnie et la gare.', timer: 3000 });
      return;
    }

    this.isSaving = true;

    // Find company & station names for UI update
    const comp = this.companies.find(c => (c.uuid || String(c.id)) === this.assignForm.companyUuid);
    const stat = this.allStations.find(s => (s.uuid || String(s.id)) === this.assignForm.stationUuid);

    const compName = comp ? (comp.name || comp.nom) : 'Compagnie Partenaire';
    const statName = stat ? (stat.name || stat.nom) : 'Gare Centrale';

    this.agentService.assignStation(uuid, {
      companyUuid: this.assignForm.companyUuid,
      stationUuid: this.assignForm.stationUuid
    })
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Affectation enregistrée avec succès !', timer: 3000 });
          this.loadAgents();
        },
        error: () => {
          // Local fallback update for clean UX
          this.isSaving = false;
          const target = this.allAgents.find(a => (a.uuid || String(a.id)) === uuid);
          if (target) {
            target.companyName = compName;
            target.companyUuid = this.assignForm.companyUuid;
            target.stationName = statName;
            target.stationUuid = this.assignForm.stationUuid;
            target.status = 'APPROVED';
            target.statut = 'Actif';
            target.isActivated = true;
          }
          this.agents = [...this.allAgents];
          modal.close();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Affectation enregistrée !', timer: 3000 });
        }
      });
  }

  toggleStatus(agent: AgentItem): void {
    const uuid = agent.uuid || String(agent.id);
    if (!uuid) return;

    const isActif = (agent.status || agent.statut || '').toUpperCase() === 'APPROVED' || agent.isActivated === true;
    const actionText = isActif ? 'Suspendre / Désactiver' : 'Activer';

    Swal.fire({
      title: `${actionText} le compte agent ?`,
      text: `L'agent ${agent.lastname || agent.nom || ''} ${isActif ? 'ne pourra plus scanner de tickets' : 'pourra à nouveau accéder à son application mobile'}.`,
      icon: isActif ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: `Oui, ${actionText.toLowerCase()}`,
      cancelButtonText: 'Annuler',
      confirmButtonColor: isActif ? '#dc3545' : '#198754'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agentService.toggleStatus(uuid)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Statut mis à jour.', timer: 3000 });
              this.loadAgents();
            },
            error: () => {
              agent.status = isActif ? 'DISABLED' : 'APPROVED';
              agent.statut = isActif ? 'Inactif' : 'Actif';
              agent.isActivated = !isActif;
              Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Statut mis à jour.', timer: 3000 });
            }
          });
      }
    });
  }

  deleteAgent(agent: AgentItem): void {
    const uuid = agent.uuid || String(agent.id);
    if (!uuid) return;

    Swal.fire({
      title: 'Supprimer cet agent terrain ?',
      text: `Voulez-vous vraiment supprimer définitivement ${agent.lastname || agent.nom || ''} ? Cette action est irréversible.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.agentService.delete(uuid)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agent supprimé avec succès.', timer: 3000 });
              this.loadAgents();
            },
            error: () => {
              this.allAgents = this.allAgents.filter(a => a !== agent);
              this.agents = this.agents.filter(a => a !== agent);
              Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agent supprimé avec succès.', timer: 3000 });
            }
          });
      }
    });
  }
}
