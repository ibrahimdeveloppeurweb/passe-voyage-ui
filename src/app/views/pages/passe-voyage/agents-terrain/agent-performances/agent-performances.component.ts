import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiService } from '../../../../../utils/api.service';

export interface PerformanceItem {
  id?: number;
  uuid?: string;
  agent: string;
  agentName?: string;
  agentCode?: string;
  phoneNumber?: string;
  gare: string;
  validations: number;
  validationsCount?: number;
  ventesPhysiques: number;
  refusedCount: number;
  montantRefuse: number;
  statut: string;
  appreciation?: string;
}

@Component({
  selector: 'app-agent-performances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-performances.component.html',
  styleUrl: './agent-performances.component.scss'
})
export class AgentPerformancesComponent implements OnInit, OnDestroy {
  rawPerformances: PerformanceItem[] = [];
  performances: PerformanceItem[] = [];
  isLoading: boolean = false;

  showAdvancedFilters: boolean = false;
  advSearchTerm: string = '';
  advAppreciationFilter: string = '';
  filterDate: string = new Date().toISOString().split('T')[0];

  totalValidations: number = 0;
  totalVentes: number = 0;
  totalRefuses: number = 0;
  totalMontantRefuse: number = 0;

  private unsubscribeAll$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadPerformances();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadPerformances(): void {
    this.isLoading = true;

    const endpoint = 'private/agent/performances';
    const params: any = {};
    if (this.filterDate) params.date = this.filterDate;
    if (this.advSearchTerm && this.advSearchTerm.trim()) params.search = this.advSearchTerm.trim();
    if (this.advAppreciationFilter) params.appreciation = this.advAppreciationFilter;

    this.api._get(endpoint, params)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: PerformanceItem[] = [];
          if (Array.isArray(res)) list = res;
          else if (res && res.data && Array.isArray(res.data)) list = res.data;
          else if (res && res.performances && Array.isArray(res.performances)) list = res.performances;

          this.rawPerformances = list;
          this.performances = list;
          this.calculateTotals(list);
        },
        error: () => {
          // Fallback to public endpoint if private route fails
          this.api._get('public/agent/performances', params)
            .pipe(takeUntil(this.unsubscribeAll$))
            .subscribe({
              next: (res: any) => {
                this.isLoading = false;
                let list: PerformanceItem[] = [];
                if (Array.isArray(res)) list = res;
                else if (res && res.data && Array.isArray(res.data)) list = res.data;
                else if (res && res.performances && Array.isArray(res.performances)) list = res.performances;

                this.rawPerformances = list;
                this.performances = list;
                this.calculateTotals(list);
              },
              error: () => {
                this.isLoading = false;
                this.rawPerformances = [];
                this.performances = [];
                this.calculateTotals([]);
              }
            });
        }
      });
  }

  applyFilters(): void {
    this.loadPerformances();
  }

  resetFilters(): void {
    this.advSearchTerm = '';
    this.advAppreciationFilter = '';
    this.filterDate = new Date().toISOString().split('T')[0];
    this.loadPerformances();
  }

  calculateTotals(items: PerformanceItem[]): void {
    let val = 0;
    let vent = 0;
    let ref = 0;
    let mRef = 0;

    items.forEach(p => {
      val += p.validations || p.validationsCount || 0;
      vent += p.ventesPhysiques || 0;
      ref += p.refusedCount || 0;
      mRef += p.montantRefuse || 0;
    });

    this.totalValidations = val;
    this.totalVentes = vent;
    this.totalRefuses = ref;
    this.totalMontantRefuse = mRef;
  }

  onDateChange(): void {
    this.loadPerformances();
  }

  getBadgeClass(statut: string): string {
    const s = (statut || '').toUpperCase();
    if (s === 'EXCELLENT') return 'bg-success';
    if (s === 'BON') return 'bg-primary';
    if (s === 'MOYEN') return 'bg-warning text-dark';
    return 'bg-secondary';
  }

  exportPerformances(): void {
    if (this.performances.length === 0) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Aucune donnée à exporter', timer: 3000 });
      return;
    }

    const headers = ['Agent', 'Gare', 'Billets Validés (Scans)', 'Ventes Physiques (XOF)', 'Billets Refusés', 'Montant Refusé (XOF)', 'Appréciation'];
    const rows = this.performances.map(p => [
      `"${p.agent}"`,
      `"${p.gare}"`,
      p.validations || 0,
      p.ventesPhysiques || 0,
      p.refusedCount || 0,
      p.montantRefuse || 0,
      `"${p.statut || p.appreciation || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `performances_agents_${this.filterDate || 'toutes'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Exportation CSV générée !', timer: 3000 });
  }
}
