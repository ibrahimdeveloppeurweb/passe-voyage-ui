import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../../core/services/ticket/ticket.service';
import { CompanyService } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

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
  companiesList: string[] = [];

  currentPage: number = 1;
  pageSize: number = 10;
  serverTotalItems: number = 0;
  
  kpis = {
    total: 0,
    valides: 0,
    consommes: 0,
    refuses: 0,
    annules: 0
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private ticketService: TicketService,
    private companyService: CompanyService
  ) { }

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
    
    // Server-side pagination
    params.page = this.currentPage;
    params.limit = this.pageSize;

    this.ticketService.getList(params)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          const data = response?.data || response?.tickets || [];
          this.billets = Array.isArray(data) ? data : [];
          
          if (response?.meta) {
              this.serverTotalItems = response.meta.total || 0;
          } else {
              this.serverTotalItems = this.billets.length;
          }
          
          if (response?.kpis) {
              this.kpis = response.kpis;
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
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Erreur lors de la récupération des billets:', err);
          this.billets = [];
        }
      });
  }

  applyAdvancedFilters(): void {
    this.currentPage = 1;
    this.loadBillets();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.advStatusFilter = '';
    this.advCompanyFilter = '';
    this.currentPage = 1;
    this.loadBillets();
  }

  get paginatedBillets(): any[] {
    return this.billets;
  }

  get totalPages(): number {
    if (this.pageSize === 0) return 1;
    return Math.ceil(this.serverTotalItems / this.pageSize) || 1;
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBillets();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadBillets();
  }

  get countTotal(): number {
    return this.kpis.total;
  }

  get countValides(): number {
    return this.kpis.valides;
  }

  get countConsommes(): number {
    return this.kpis.consommes;
  }

  get countRefuses(): number {
    return this.kpis.refuses;
  }

  get countAnnules(): number {
    return this.kpis.annules;
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
             <div style="margin-bottom: 4px; color: #475569;">
               <strong>Heure du scan :</strong> <span style="color: #0f172a; font-weight: 600;">${billet.validatedAt}</span>
             </div>
           ` : ''}
           ${billet.verificationContact ? `
             <div style="margin-bottom: 4px; color: #475569;">
               <strong>Contact Passager :</strong> <span style="color: #10b981; font-weight: 700;">${billet.verificationContact} <i class="feather icon-check-circle" style="font-size:12px;"></i></span>
             </div>
           ` : ''}
           ${billet.passengerPhoto ? `
             <div style="margin-top: 8px; text-align: center;">
               <a href="${billet.passengerPhoto.startsWith('http') ? billet.passengerPhoto : environment.serverUrlPiture + billet.passengerPhoto}" target="_blank" title="Cliquez pour agrandir">
                 <img src="${billet.passengerPhoto.startsWith('http') ? billet.passengerPhoto : environment.serverUrlPiture + billet.passengerPhoto}" 
                      style="width: 90px; height: 90px; object-fit: cover; border-radius: 8px; border: 2px solid #e2e8f0; cursor: pointer; transition: transform 0.2s;" 
                      alt="Photo Passager"
                      onmouseover="this.style.transform='scale(1.05)'"
                      onmouseout="this.style.transform='scale(1)'"/>
               </a>
               <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Cliquez sur la photo pour l'agrandir</div>
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
            <span class="badge ${badgeClass}" style="font-size: 14px; padding: 6px 12px; text-transform: uppercase;">
              ${this.formatStatusFr(billet.qrStatus || billet.status)}
            </span>
          </div>
          ${refusalHtml}
          ${controlInfoHtml}
          <div style="margin-top: 12px; color: #9CA3AF; font-size: 12px;">Date de voyage : ${this.formatDateToFr(billet.dateValidite)}</div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
    });
  }

  formatDateToFr(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  formatStatusFr(status: string): string {
    if (!status) return 'INCONNU';
    const s = status.toUpperCase();
    if (s === 'SCANNED' || s === 'SCANNE' || s === 'USED' || s === 'CONSOMMÉ' || s === 'CONSOMME') return 'Scanné';
    if (s === 'EXPIRED' || s === 'EXPIRE') return 'Expiré';
    if (s === 'REFUSED' || s === 'REJECTED' || s === 'REFUSE' || s === 'REFUSÉ') return 'Refusé';
    if (s === 'VALID' || s === 'VALIDE') return 'Valide';
    if (s === 'CANCELLED' || s === 'ANNULE' || s === 'ANNULÉ') return 'Annulé';
    return status;
  }
}
