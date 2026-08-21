import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PassengerService, PassengerItem } from '../../../../../core/services/passenger/passenger.service';
import { CreditService } from '../../../../../core/services/credit/credit.service';
import { Subject, takeUntil } from 'rxjs';

export interface CreanceDisplayItem {
  id: string;
  refCredit: string;
  passagerName: string;
  passagerIdCode: string;
  passagerPhone: string;
  dateEmission: string;
  montant: number;
  joursRetard: number;
  delaiOptionDays: number;
  statut: 'Dans les temps' | 'En retard' | 'Critique';
  rawPassenger?: PassengerItem;
}

@Component({
  selector: 'app-rec-creances',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './rec-creances.component.html',
  styleUrl: './rec-creances.component.scss'
})
export class RecCreancesComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  showAdvancedFilters: boolean = false;
  advSearchTerm: string = '';
  advStatusFilter: string = '';

  allCreances: CreanceDisplayItem[] = [];
  creances: CreanceDisplayItem[] = [];
  selectedCreance: CreanceDisplayItem | null = null;

  delaiOptionGlobal: number = 14;

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private passengerService: PassengerService,
    private creditService: CreditService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadCreances();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadCreances(): void {
    this.isLoading = true;
    const params: any = { count: 1000, financialStatus: 'IMPAYE' };
    if (this.advSearchTerm && this.advSearchTerm.trim() !== '') {
      params.search = this.advSearchTerm.trim();
    }

    this.passengerService.getList(params)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          const list: PassengerItem[] = Array.isArray(data) ? data : (data?.data || []);

          let items: CreanceDisplayItem[] = [];
          
          list.forEach((p: PassengerItem) => {
            const debt = Number(p.totalDebt ?? p.solde ?? 0);
            if (debt > 0 || p.isOverdue === true) {
              const delai = p.delaiOptionDays || 14;
              this.delaiOptionGlobal = delai;
              const retard = p.daysOverdue ?? 0;
              
              let statut: 'Dans les temps' | 'En retard' | 'Critique' = 'Dans les temps';
              if (retard > 30) {
                statut = 'Critique';
              } else if (retard > 0) {
                statut = 'En retard';
              }

              const passId = this.getPassengerId(p);
              const fullName = this.getFullName(p);

              items.push({
                id: String(p.id || p.uuid),
                refCredit: p.code ? `CR-${p.code}` : `CR-${p.id}`,
                passagerName: fullName,
                passagerIdCode: passId,
                passagerPhone: p.phoneNumber || p.telephone || 'N/A',
                dateEmission: this.formatDate(p.createdAt || (p as any).inscription),
                montant: debt,
                joursRetard: retard,
                delaiOptionDays: delai,
                statut: statut,
                rawPassenger: p
              });
            }
          });

          this.allCreances = items;
          this.filterLocally();
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Erreur chargement créances:', err);
          this.allCreances = [];
          this.creances = [];
        }
      });
  }

  applyFilters(): void {
    this.loadCreances();
  }

  resetFilters(): void {
    this.advSearchTerm = '';
    this.advStatusFilter = '';
    this.loadCreances();
  }

  private filterLocally(): void {
    let result = [...this.allCreances];

    if (this.advStatusFilter && this.advStatusFilter.trim() !== '') {
      result = result.filter(c => c.statut === this.advStatusFilter);
    }

    this.creances = result;
  }

  openDetailModal(content: TemplateRef<any>, creance: CreanceDisplayItem): void {
    this.selectedCreance = creance;
    this.modalService.open(content, { centered: true, size: 'md' });
  }

  get totalCreances(): number {
    return this.creances.reduce((acc, curr) => acc + curr.montant, 0);
  }

  get countDansLesTemps(): number {
    return this.allCreances.filter(c => c.statut === 'Dans les temps').length;
  }

  get countEnRetard(): number {
    return this.allCreances.filter(c => c.statut === 'En retard').length;
  }

  get countCritique(): number {
    return this.allCreances.filter(c => c.statut === 'Critique').length;
  }

  private getFullName(p: any): string {
    const fn = p.firstname || p.firstName || p.prenom || '';
    const ln = p.lastname || p.lastName || p.nom || '';
    const full = `${fn} ${ln}`.trim();
    if (full) return full;
    return p.phoneNumber || p.telephone || 'Passager Inconnu';
  }

  private getPassengerId(p: PassengerItem): string {
    if (p.code) return p.code;
    if (p.id) return `PASS-${p.id}`;
    if (p.uuid) return `PASS-${p.uuid.substring(0, 4)}`;
    return 'PASS-N/A';
  }

  private formatDate(dateVal: any): string {
    if (!dateVal) return new Date().toLocaleDateString('fr-FR');
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('fr-FR');
    } catch {
      return String(dateVal);
    }
  }
}
