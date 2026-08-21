import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../../core/services/ticket/ticket.service';
import { CompanyService } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cred-billets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cred-billets.component.html',
  styleUrl: './cred-billets.component.scss'
})
export class CredBilletsComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  showAdvancedFilters: boolean = false;

  searchTerm: string = '';
  advStatusFilter: string = '';
  advCompanyFilter: string = '';

  billets: any[] = [];
  filteredBillets: any[] = [];
  companiesList: string[] = [];

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private ticketService: TicketService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadBillets();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  loadCompanies(): void {
    this.companyService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          if (Array.isArray(list) && list.length > 0) {
            const comps = new Set<string>();
            list.forEach((c: any) => {
              const name = c.name || c.nom;
              if (name && name.trim() !== '') {
                comps.add(name.trim());
              }
            });
            if (comps.size > 0) {
              this.companiesList = Array.from(comps);
            }
          }
        },
        error: (err: any) => {
          console.error('Erreur chargement des compagnies:', err);
        }
      });
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadBillets(): void {
    this.loading = true;
    const params: any = {};
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      params.search = this.searchTerm.trim();
    }
    if (this.advStatusFilter && this.advStatusFilter.trim() !== '') {
      params.status = this.advStatusFilter.trim();
    }
    if (this.advCompanyFilter && this.advCompanyFilter.trim() !== '') {
      params.company = this.advCompanyFilter.trim();
    }

    this.ticketService.getList(params)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          const data = response?.data || response?.tickets || response;
          if (Array.isArray(data)) {
            this.billets = data;
          } else {
            this.billets = [];
          }

          if (this.companiesList.length === 0) {
            const comps = new Set<string>();
            this.billets.forEach(b => {
              if (b.compagnie && b.compagnie.trim() !== '') {
                comps.add(b.compagnie.trim());
              }
            });
            this.companiesList = Array.from(comps);
          }

          this.filterBillets();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Erreur lors de la récupération des billets:', err);
          this.billets = [];
          this.filterBillets();
        }
      });
  }

  applyAdvancedFilters(): void {
    this.loadBillets();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.advStatusFilter = '';
    this.advCompanyFilter = '';
    this.loadBillets();
  }

  filterBillets(): void {
    let result = [...this.billets];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(b => 
        (b.num && b.num.toLowerCase().includes(term)) ||
        (b.passager && b.passager.toLowerCase().includes(term)) ||
        (b.compagnie && b.compagnie.toLowerCase().includes(term)) ||
        (b.trajet && b.trajet.toLowerCase().includes(term)) ||
        (b.dateValidite && b.dateValidite.toLowerCase().includes(term)) ||
        (b.qrStatus && b.qrStatus.toLowerCase().includes(term))
      );
    }

    if (this.advStatusFilter && this.advStatusFilter.trim() !== '') {
      const sf = this.advStatusFilter.toLowerCase().trim();
      result = result.filter(b => (b.qrStatus && b.qrStatus.toLowerCase().includes(sf)) || (b.status && b.status.toLowerCase().includes(sf)));
    }

    if (this.advCompanyFilter && this.advCompanyFilter.trim() !== '') {
      result = result.filter(b => b.compagnie === this.advCompanyFilter);
    }

    this.filteredBillets = result;
  }

  get countTotal(): number {
    return this.filteredBillets.length;
  }

  get countValides(): number {
    return this.filteredBillets.filter(b => {
      const qrSt = (b.qrStatus || '').toUpperCase();
      const st = (b.status || '').toUpperCase();
      return qrSt === 'VALIDE' || qrSt === 'VALID' || st === 'VALIDE' || st === 'VALID';
    }).length;
  }

  get countConsommes(): number {
    return this.filteredBillets.filter(b => {
      const qrSt = (b.qrStatus || '').toUpperCase();
      const st = (b.status || '').toUpperCase();
      if (qrSt === 'REFUSÉ' || qrSt === 'REFUSE' || st === 'REFUSED' || st === 'REJECTED') {
        return false;
      }
      return qrSt === 'SCANNÉ' || qrSt === 'SCANNE' || qrSt === 'SCANNED' || qrSt === 'CONSOMMÉ' || qrSt === 'CONSOMME' || st === 'SCANNE' || st === 'SCANNED' || st === 'USED' || st === 'CONSOMME' || b.isUsed === true;
    }).length;
  }

  get countRefuses(): number {
    return this.filteredBillets.filter(b => {
      const qrSt = (b.qrStatus || '').toUpperCase();
      const st = (b.status || '').toUpperCase();
      return qrSt === 'REFUSÉ' || qrSt === 'REFUSE' || st === 'REFUSED' || st === 'REJECTED';
    }).length;
  }

  get countAnnules(): number {
    return this.filteredBillets.filter(b => {
      const qrSt = (b.qrStatus || '').toUpperCase();
      const st = (b.status || '').toUpperCase();
      return qrSt === 'ANNULÉ' || qrSt === 'ANNULE' || qrSt === 'EXPIRÉ' || qrSt === 'EXPIRE' || st === 'ANNULE' || st === 'EXPIRE' || st === 'CANCELLED' || st === 'EXPIRED';
    }).length;
  }

  voirQrCode(billet: any): void {
    let qrHtml = '';
    if (billet.qrCodeContent && billet.qrCodeContent.length > 20) {
      qrHtml = `<img src="${billet.qrCodeContent}" style="width: 220px; height: 220px; object-fit: contain; margin: 15px auto;" alt="QR Code"/>`;
    } else {
      qrHtml = `
        <div style="padding: 20px; background: #f3f4f6; border-radius: 12px; margin: 15px auto; width: 220px;">
          <i class="feather icon-qr-code" style="font-size: 100px; color: #4b5563;"></i>
          <div style="font-weight: bold; margin-top: 10px; font-size: 16px; color: #111827;">${billet.num}</div>
        </div>
      `;
    }

    const isRefused = billet.qrStatus === 'Refusé' || billet.status === 'REFUSED';
    const badgeClass = billet.qrStatus === 'Valide' ? 'bg-success' : (isRefused ? 'bg-danger' : 'bg-secondary');
    
    const agentName = billet.validatedByAgentName || 
      (billet.validatedByAgent ? (billet.validatedByAgent.displayName || `${billet.validatedByAgent.firstname || ''} ${billet.validatedByAgent.lastname || ''}`.trim()) : null) || 
      (billet.agent ? (billet.agent.displayName || `${billet.agent.firstname || ''} ${billet.agent.lastname || ''}`.trim()) : null);

    const stationName = billet.validatedAtStationName || 
      (billet.validatedAtStation ? billet.validatedAtStation.name : null) ||
      (billet.station ? billet.station.name : null);

    const refusalHtml = isRefused && billet.refusalComment
      ? `<div style="margin-top: 10px; padding: 10px; background: #fee2e2; border-radius: 8px; color: #dc2626; font-size: 13px; font-weight: 500;">
           <strong>Motif du Refus :</strong> ${billet.refusalComment}
         </div>`
      : '';

    const controlInfoHtml = (agentName || stationName || billet.validatedAt)
      ? `<div style="margin-top: 14px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; text-align: left; font-size: 13px;">
           <div style="font-weight: 700; color: #1e293b; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; display: flex; align-items: center;">
             <i class="feather icon-shield" style="color: #2563eb; margin-right: 6px; font-size: 14px;"></i> Contrôle & Validation du Billet
           </div>
           ${stationName ? `
             <div style="margin-bottom: 4px; color: #475569;">
               <strong>Gare de contrôle :</strong> <span style="color: #0f172a; font-weight: 600;">${stationName}</span>
             </div>
           ` : ''}
           ${agentName ? `
             <div style="margin-bottom: 4px; color: #475569;">
               <strong>Agent Contrôleur :</strong> <span style="color: #2563eb; font-weight: 700;">${agentName}</span>
             </div>
           ` : ''}
           ${billet.validatedAt ? `
             <div style="color: #475569;">
               <strong>Heure du scan :</strong> <span style="color: #0f172a; font-weight: 600;">${billet.validatedAt}</span>
             </div>
           ` : ''}
         </div>`
      : '';

    Swal.fire({
      title: `Pass Virtuel : ${billet.num}`,
      html: `
        <div style="text-align: center;">
          <div style="font-size: 18px; font-weight: bold; color: #1F2937;">${billet.passager}</div>
          <div style="color: #6B7280; font-size: 14px; margin-top: 4px;">${billet.compagnie} • ${billet.trajet}</div>
          ${qrHtml}
          <div style="margin-top: 10px;">
            <span class="badge ${badgeClass}" style="font-size: 14px; padding: 6px 12px;">
              ${billet.qrStatus || billet.status}
            </span>
          </div>
          ${refusalHtml}
          ${controlInfoHtml}
          <div style="margin-top: 12px; color: #9CA3AF; font-size: 12px;">Date de voyage : ${billet.dateValidite}</div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
    });
  }
}
