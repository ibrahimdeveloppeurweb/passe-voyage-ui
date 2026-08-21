import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PassengerService, PassengerItem } from '../../../../../core/services/passenger/passenger.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rec-relances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rec-relances.component.html',
  styleUrl: './rec-relances.component.scss'
})
export class RecRelancesComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  showAdvancedFilters: boolean = false;

  searchTerm: string = '';
  advLevelFilter: string = '';

  alertes: any[] = [];
  allAlertes: any[] = [];

  private unsubscribeAll$ = new Subject<void>();

  constructor(private passengerService: PassengerService) {}

  ngOnInit(): void {
    this.loadAlertes();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadAlertes(): void {
    this.loading = true;
    const params: any = {
      financialStatus: 'Impayé (Retards)',
      onlyOverdue: 1,
      minDebt: 1
    };

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      params.search = this.searchTerm.trim();
    }

    this.passengerService.getList(params)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          const data = Array.isArray(response) ? response : (response?.data || []);
          if (Array.isArray(data)) {
            this.allAlertes = data
              .filter((p: any) => (p.totalDebt || 0) > 0 && (p.daysOverdue || 0) > 0)
              .map((p: any) => this.mapDebtorPassenger(p));
          } else {
            this.allAlertes = [];
          }

          this.applyFiltersLocally();
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Erreur chargement des relances et alertes:', err);
          this.allAlertes = [];
          this.alertes = [];
        }
      });
  }

  applyAdvancedFilters(): void {
    this.loadAlertes();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.advLevelFilter = '';
    this.loadAlertes();
  }

  private applyFiltersLocally(): void {
    let result = [...this.allAlertes];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(a =>
        (a.passager && a.passager.toLowerCase().includes(term)) ||
        (a.telephone && a.telephone.toLowerCase().includes(term)) ||
        (a.code && a.code.toLowerCase().includes(term))
      );
    }

    if (this.advLevelFilter && this.advLevelFilter.trim() !== '') {
      result = result.filter(a => a.niveau === this.advLevelFilter);
    }

    this.alertes = result;
  }

  private mapDebtorPassenger(p: any): any {
    const fname = p.firstname || p.firstName || p.prenom || '';
    const lname = p.lastname || p.lastName || p.nom || '';
    let passagerName = `${fname} ${lname}`.trim();
    if (!passagerName) {
      passagerName = p.fullName || p.phoneNumber || 'Passager Débiteur';
    }

    const code = p.code || (p.id ? `PS-${String(p.id).padStart(4, '0')}` : 'PS-0000');
    const displayName = `${passagerName} (${code})`;
    const phone = p.phoneNumber || p.telephone || p.phone || 'N/A';
    const dette = p.totalDebt || 0;
    const joursRetard = p.daysOverdue !== undefined && p.daysOverdue !== null ? p.daysOverdue : (p.isOverdue ? 15 : 0);

    let niveau = 'Faible';
    if (joursRetard > 30) {
      niveau = 'Haut';
    } else if (joursRetard >= 15) {
      niveau = 'Moyen';
    }

    let derniereRelance = 'Jamais';
    if (p.lastReminderSentAt) {
      derniereRelance = new Date(p.lastReminderSentAt).toLocaleDateString('fr-FR');
    }

    return {
      id: p.id,
      uuid: p.uuid,
      code: code,
      passager: displayName,
      rawName: passagerName,
      telephone: phone,
      dette: dette,
      joursRetard: joursRetard,
      niveau: niveau,
      derniereRelance: derniereRelance,
      rawItem: p
    };
  }

  get countTotalDebiteurs(): number {
    return this.allAlertes.length;
  }

  get totalImpaye(): number {
    return this.allAlertes.reduce((sum, a) => sum + (a.dette || 0), 0);
  }

  get countCritical(): number {
    return this.allAlertes.filter(a => a.niveau === 'Haut').length;
  }

  get countRemindersSent(): number {
    return this.allAlertes.filter(a => a.derniereRelance !== 'Jamais').length;
  }

  envoyerSMS(alerte: any): void {
    Swal.fire({
      title: 'Envoyer une relance ?',
      text: `Voulez-vous envoyer une relance SMS / Notification à ${alerte.rawName} (${alerte.telephone}) pour une dette de ${Number(alerte.dette).toLocaleString('fr-FR')} FCFA ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, Relancer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.passengerService.sendReminder(alerte.id || alerte.uuid).subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'Relance Envoyée !',
              text: res.message || `Le message de relance a bien été transmis à ${alerte.rawName}.`,
              icon: 'success',
              timer: 2500,
              showConfirmButton: false
            });
            alerte.derniereRelance = 'À l\'instant';
            this.loadAlertes();
          },
          error: (err: any) => {
            console.error('Erreur lors de l\'envoi de la relance:', err);
            Swal.fire('Erreur', 'Impossible d\'envoyer la relance : ' + (err.error?.message || err.message), 'error');
          }
        });
      }
    });
  }

  relancerToutLeMonde(): void {
    if (this.allAlertes.length === 0) {
      Swal.fire('Information', 'Aucun passager débiteur en retard à relancer.', 'info');
      return;
    }

    Swal.fire({
      title: 'Relancer tous les débiteurs ?',
      text: `Voulez-vous envoyer une notification de relance à l'ensemble des ${this.allAlertes.length} passagers débiteurs pour un montant total de ${Number(this.totalImpaye).toLocaleString('fr-FR')} FCFA ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, Relancer Tout le Monde',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.passengerService.sendAllReminders().subscribe({
          next: (res: any) => {
            Swal.fire({
              title: 'Campagne de relance effectuée !',
              text: res.message || `Relances envoyées à ${res.count || this.allAlertes.length} passagers débiteurs.`,
              icon: 'success'
            });
            this.loadAlertes();
          },
          error: (err: any) => {
            console.error('Erreur lors de la relance globale:', err);
            Swal.fire('Erreur', 'Impossible d\'effectuer la relance globale : ' + (err.error?.message || err.message), 'error');
          }
        });
      }
    });
  }
}
