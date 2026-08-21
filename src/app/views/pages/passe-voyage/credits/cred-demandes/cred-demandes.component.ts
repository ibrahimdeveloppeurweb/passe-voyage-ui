import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../../../../../core/services/credit/credit.service';
import { CompanyService } from '../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cred-demandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cred-demandes.component.html',
  styleUrl: './cred-demandes.component.scss'
})
export class CredDemandesComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  showAdvancedFilters: boolean = false;

  searchTerm: string = '';
  advStatusFilter: string = '';
  advCompanyFilter: string = '';
  advTypeFilter: string = '';

  demandes: any[] = [];
  allDemandes: any[] = [];
  companiesList: string[] = [];

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private creditService: CreditService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadDemandes();
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

  loadDemandes(): void {
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

    this.creditService.getList(params)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          const data = response?.data || response;
          if (Array.isArray(data)) {
            const mapped = data.map((item: any) => this.mapCreditRequest(item));
            this.allDemandes = mapped.sort((a: any, b: any) => (b.rawItem?.id || 0) - (a.rawItem?.id || 0));
          } else {
            this.allDemandes = [];
          }

          if (this.companiesList.length === 0) {
            const comps = new Set<string>();
            this.allDemandes.forEach(d => {
              if (d.compagnie && d.compagnie.trim() !== '') {
                comps.add(d.compagnie.trim());
              }
            });
            this.companiesList = Array.from(comps);
          }

          this.applyFiltersLocally();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Erreur chargement des demandes de crédit:', err);
          this.allDemandes = [];
          this.demandes = [];
        }
      });
  }

  applyAdvancedFilters(): void {
    this.loadDemandes();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.advStatusFilter = '';
    this.advCompanyFilter = '';
    this.advTypeFilter = '';
    this.loadDemandes();
  }

  private applyFiltersLocally(): void {
    let result = [...this.allDemandes];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(d => 
        (d.id && d.id.toLowerCase().includes(term)) ||
        (d.passager && d.passager.toLowerCase().includes(term)) ||
        (d.phone && d.phone.toLowerCase().includes(term)) ||
        (d.trajet && d.trajet.toLowerCase().includes(term)) ||
        (d.compagnie && d.compagnie.toLowerCase().includes(term)) ||
        (d.statut && d.statut.toLowerCase().includes(term))
      );
    }

    if (this.advStatusFilter && this.advStatusFilter.trim() !== '') {
      result = result.filter(d => d.statut === this.advStatusFilter);
    }

    if (this.advCompanyFilter && this.advCompanyFilter.trim() !== '') {
      result = result.filter(d => d.compagnie === this.advCompanyFilter);
    }

    if (this.advTypeFilter && this.advTypeFilter.trim() !== '') {
      result = result.filter(d => d.typeTrajet === this.advTypeFilter);
    }

    this.demandes = result;
  }

  get countTotal(): number {
    return this.allDemandes.length;
  }

  get countEnAttente(): number {
    return this.allDemandes.filter(d => d.statut === 'En attente').length;
  }

  get countApprouvees(): number {
    return this.allDemandes.filter(d => d.statut === 'Approuvé').length;
  }

  get countRejetees(): number {
    return this.allDemandes.filter(d => d.statut === 'Rejeté').length;
  }

  private mapCreditRequest(item: any): any {
    const passenger = item.passenger;
    let passagerName = '';
    let phone = '';
    let lieu = '';

    if (passenger) {
      const fname = passenger.firstname || passenger.firstName || passenger.prenom || '';
      const lname = passenger.lastname || passenger.lastName || passenger.nom || '';
      passagerName = `${fname} ${lname}`.trim();
      phone = passenger.phoneNumber || passenger.phone || passenger.telephone || '';
      lieu = passenger.residenceAddress || passenger.residenceCity || passenger.address || passenger.city || passenger.ville || '';

      if (!passagerName) {
        passagerName = passenger.fullName || phone || 'Passager Inconnu';
      }
    } else {
      passagerName = 'Passager Inconnu';
    }

    const companyName = item.company?.name || item.company?.nom || item.companyName || item.departureCompany || 'UTB';
    const trajet = `${item.departureCity || 'Abidjan'} - ${item.arrivalCity || 'Yamoussoukro'}`;
    const isRound = (item.isRoundTrip !== undefined && item.isRoundTrip !== null)
      ? Boolean(item.isRoundTrip)
      : (item.typeVoyage === 'ALLER_RETOUR' || item.typeVoyage === 'ROUND_TRIP' || !!item.returnDate);
    const typeTrajet = isRound ? 'Aller-retour' : 'Aller simple';
    const passagers = item.passengerCount || 1;
    const ticketsList = item.tickets || [];
    const billets = ticketsList.length > 0 ? ticketsList.length : passagers;
    const total = item.totalAmount || 5000;
    const frais = item.serviceFee || 0;
    const creditTransport = item.amountRequested || (total > frais ? total - frais : total);
    const unitPrice = item.unitPrice || (creditTransport / billets) || 5000;

    let statutStr = 'En attente';
    const stUpper = (item.status || '').toString().toUpperCase();
    if (['APPROVED', 'VALIDE', 'VALIDATED'].includes(stUpper)) {
      statutStr = 'Approuvé';
    } else if (['REJECTED', 'REFUSE', 'CANCELLED'].includes(stUpper)) {
      statutStr = 'Rejeté';
    }

    const ref = item.uuid ? `REQ-${item.id || item.uuid.substring(0, 4)}` : `REQ-${item.id}`;

    return {
      id: ref,
      uuid: item.uuid || item.id,
      rawItem: item,
      passager: passagerName,
      phone: phone,
      lieu: lieu,
      compagnie: companyName,
      typeTrajet: typeTrajet,
      passagers: passagers,
      billets: billets,
      prixUnitaire: unitPrice,
      creditTransport: creditTransport,
      montant: total,
      frais: frais,
      trajet: trajet,
      score: passenger?.creditScore || passenger?.riskScore || passenger?.score || 85,
      dateVoyage: item.travelDate ? new Date(item.travelDate).toLocaleDateString('fr-FR') : '',
      dateRetour: item.returnDate ? new Date(item.returnDate).toLocaleDateString('fr-FR') : null,
      dateOnly: item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '',
      timeOnly: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
      date: this.formatSubmissionDate(item.createdAt),
      statut: statutStr,
      tickets: ticketsList
    };
  }

  private formatSubmissionDate(dateVal: any): string {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const dateStr = d.toLocaleDateString('fr-FR');
      const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} à ${timeStr}`;
    } catch {
      return String(dateVal);
    }
  }

  voirDetails(demande: any): void {
    const raw = demande.rawItem || {};
    const tickets = demande.tickets || raw.tickets || [];
    let ticketsHtml = '';

    if (tickets.length > 0) {
      const isGrid = tickets.length > 1;
      const gridStyle = isGrid
        ? 'display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 4px;'
        : 'display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 4px;';

      ticketsHtml = `
        <div style="margin-top: 15px; text-align: left; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="font-weight: bold; margin-bottom: 10px; color: #1e293b; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
            <span><i class="feather icon-ticket" style="margin-right: 6px; color: #3b82f6;"></i> Billet(s) Généré(s) (${tickets.length}) :</span>
            ${tickets.length > 2 ? '<span style="font-size: 11px; font-weight: normal; color: #64748b; background: #e2e8f0; padding: 2px 10px; border-radius: 12px;">Défiler pour tout voir ↓</span>' : ''}
          </div>
          <div style="${gridStyle}">
            ${tickets.map((t: any, idx: number) => {
              const num = t.ticketNumber || t.num || `TK-${t.id}`;
              const qr = t.qrCodeContent;
              const qrImg = (qr && qr.length > 20) 
                ? `<img src="${qr}" style="width: 72px; height: 72px; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1; background: white; padding: 4px;" alt="QR"/>`
                : `<div style="padding: 8px 12px; background: #e2e8f0; border-radius: 6px; text-align: center;"><i class="feather icon-qr-code" style="font-size: 28px; color: #64748b;"></i></div>`;
              
              const isUsed = t.isUsed || ['SCANNED', 'USED', 'CONSOMME'].includes((t.status || '').toUpperCase());

              return `
                <div style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                  <div style="min-width: 0; flex: 1;">
                    <div style="font-weight: 800; color: #0f172a; font-size: 13px;">Billet #${idx+1}</div>
                    <div style="font-weight: 700; color: #2563eb; font-size: 12px; margin-top: 2px; word-break: break-all;">${num}</div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 2px;">${Number(t.unitPrice || demande.prixUnitaire).toLocaleString('fr-FR')} FCFA</div>
                    <div style="margin-top: 5px;">
                      <span class="badge ${isUsed ? 'bg-secondary' : 'bg-success'}" style="font-size: 10px; padding: 3px 8px;">
                        ${isUsed ? 'Scanné' : 'Valide'}
                      </span>
                    </div>
                  </div>
                  <div style="margin-left: 12px;">
                    ${qrImg}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    Swal.fire({
      title: `Demande #${demande.id}`,
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p><strong>Passager :</strong> ${demande.passager} (${demande.phone || 'Non renseigné'})</p>
          <p><strong>Trajet :</strong> ${demande.trajet} (${demande.compagnie})</p>
          <p><strong>Option Voyage :</strong> ${demande.typeTrajet} (${demande.billets} billet(s))</p>
          <p><strong>Date Aller :</strong> ${demande.dateVoyage} ${demande.dateRetour ? ' | <strong>Date Retour :</strong> ' + demande.dateRetour : ''}</p>
          <hr>
          <p><strong>Montant Crédit Voyage :</strong> <span style="color: #2563eb; font-weight: bold;">${Number(demande.creditTransport).toLocaleString('fr-FR')} FCFA</span></p>
          <p><strong>Frais au Comptant :</strong> <span style="color: #16a34a; font-weight: bold;">${Number(demande.frais).toLocaleString('fr-FR')} FCFA</span></p>
          <p><strong>Total Billet Voyage :</strong> ${Number(demande.montant).toLocaleString('fr-FR')} FCFA</p>
          <p><strong>Score Risque Client :</strong> <span class="badge bg-success">${demande.score} / 100</span></p>
          <p><strong>Statut Actuel :</strong> <span class="badge bg-info">${demande.statut}</span></p>
          ${ticketsHtml}
        </div>
      `,
      showCloseButton: true,
      confirmButtonText: 'Fermer'
    });
  }

  approuver(demande: any): void {
    Swal.fire({
      title: 'Approuver la demande ?',
      text: `Voulez-vous approuver le crédit de ${Number(demande.creditTransport).toLocaleString('fr-FR')} FCFA pour ${demande.passager} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, Approuver',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.creditService.approveRequest(demande.uuid).subscribe({
          next: () => {
            Swal.fire('Approuvé !', 'La demande de crédit a été validée.', 'success');
            this.loadDemandes();
          },
          error: (err: any) => {
            Swal.fire('Erreur', 'Impossible d\'approuver la demande : ' + (err.error?.message || err.message), 'error');
          }
        });
      }
    });
  }

  rejeter(demande: any): void {
    Swal.fire({
      title: 'Rejeter la demande',
      input: 'textarea',
      inputLabel: 'Motif du rejet',
      inputPlaceholder: 'Entrez la raison du refus...',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Rejeter',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez saisir un motif !';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.creditService.rejectRequest(demande.uuid, result.value).subscribe({
          next: () => {
            Swal.fire('Rejeté !', 'La demande de crédit a été refusée.', 'info');
            this.loadDemandes();
          },
          error: (err: any) => {
            Swal.fire('Erreur', 'Impossible de rejeter la demande : ' + (err.error?.message || err.message), 'error');
          }
        });
      }
    });
  }
}
