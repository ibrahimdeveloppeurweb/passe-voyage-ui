import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PassengerService, PassengerItem } from '../../../../../core/services/passenger/passenger.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pass-base',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './pass-base.component.html',
  styleUrl: './pass-base.component.scss'
})
export class PassBaseComponent implements OnInit, OnDestroy {
  passagers: PassengerItem[] = [];
  allPassagers: PassengerItem[] = [];
  selectedPassager: PassengerItem | any = {};

  isLoading: boolean = false;
  isSaving: boolean = false;

  // KPI computed properties
  get totalCount(): number {
    return (this.allPassagers.length > 0 ? this.allPassagers : this.passagers).length;
  }

  get verifiedCount(): number {
    const list = this.allPassagers.length > 0 ? this.allPassagers : this.passagers;
    return list.filter(p => {
      const st = (p.identityStatus || '').toUpperCase();
      return st === 'VERIFIED' || st === 'VALIDATED' || st === 'APPROVED' || p.isIdentified === true;
    }).length;
  }

  get debtCount(): number {
    const list = this.allPassagers.length > 0 ? this.allPassagers : this.passagers;
    return list.filter(p => p.isOverdue === true || (p.daysOverdue ?? 0) > 0).length;
  }

  get pendingCount(): number {
    const list = this.allPassagers.length > 0 ? this.allPassagers : this.passagers;
    return list.filter(p => (p.identityStatus || '').toUpperCase() === 'PENDING').length;
  }

  get noDocumentCount(): number {
    const list = this.allPassagers.length > 0 ? this.allPassagers : this.passagers;
    return list.filter(p => this.getPassengerStatusInfo(p).label === 'Compte Créé').length;
  }

  // Filter toggle state
  showAdvancedFilters: boolean = false;

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Advanced Filters Form State
  advSearchTerm: string = '';
  advStatusFilter: string = '';
  advFinancialStatusFilter: string = '';
  advMinDebt: number | null = null;
  advMaxDebt: number | null = null;
  advCountFilter: number = 20;

  defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 100 100" fill="%236c757d"><circle cx="50" cy="35" r="25"/><path d="M10,90 C10,65 30,55 50,55 C70,55 90,65 90,90 Z"/></svg>';
  defaultDocPlaceholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160" fill="%23f8f9fa"><rect width="300" height="160" rx="8" fill="%23f8f9fa" stroke="%23dee2e6" stroke-width="2"/><text x="150" y="85" font-family="sans-serif" font-size="14" fill="%236c757d" text-anchor="middle">Aucun document numérisé</text></svg>';

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private passengerService: PassengerService
  ) {}

  ngOnInit(): void {
    this.loadPassagers();
  }

  loadPassagers(): void {
    this.isLoading = true;
    const rawFilters: any = {
      search: this.advSearchTerm,
      status: this.advStatusFilter,
      financialStatus: this.advFinancialStatusFilter,
      minDebt: this.advMinDebt,
      maxDebt: this.advMaxDebt,
      count: this.advCountFilter
    };

    const filters: any = {};
    Object.keys(rawFilters).forEach(key => {
      if (rawFilters[key] !== null && rawFilters[key] !== undefined && rawFilters[key] !== '') {
        filters[key] = rawFilters[key];
      }
    });

    this.passengerService.getList(filters)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: PassengerItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }
          this.passagers = list;
          if (Object.keys(filters).length === 0 || (Object.keys(filters).length === 1 && filters['count'])) {
            this.allPassagers = list;
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  applyAdvancedFilters(): void {
    this.loadPassagers();
  }

  resetFilters(): void {
    this.advSearchTerm = '';
    this.advStatusFilter = '';
    this.advFinancialStatusFilter = '';
    this.advMinDebt = null;
    this.advMaxDebt = null;
    this.advCountFilter = 20;

    this.applyAdvancedFilters();
  }

  openEditModal(content: TemplateRef<any>, passager: PassengerItem): void {
    this.selectedPassager = { ...passager };
    this.modalService.open(content, { centered: true });
  }

  openDetailModal(content: TemplateRef<any>, passager: PassengerItem): void {
    this.selectedPassager = { ...passager };
    const targetKey = passager.uuid || (passager.id ? String(passager.id) : null);
    
    if (targetKey) {
      this.passengerService.getShow(targetKey)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.selectedPassager = res;
            }
          }
        });
    }

    this.modalService.open(content, { centered: true, size: 'lg' });
  }

  openContactsModal(content: TemplateRef<any>, passager: PassengerItem): void {
    this.selectedPassager = { ...passager };
    const targetKey = passager.uuid || (passager.id ? String(passager.id) : null);
    
    if (targetKey) {
      this.passengerService.getShow(targetKey)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.selectedPassager = res;
            }
          }
        });
    }

    this.modalService.open(content, { centered: true, size: 'md' });
  }

  updatePassager(modal: any): void {
    const targetKey = this.selectedPassager.uuid || (this.selectedPassager.id ? String(this.selectedPassager.id) : null);
    if (!targetKey) return;

    this.isSaving = true;

    const payload = {
      firstname: this.selectedPassager.firstname,
      lastname: this.selectedPassager.lastname,
      phoneNumber: this.selectedPassager.phoneNumber,
      email: this.selectedPassager.email,
      maxCreditLimit: this.selectedPassager.maxCreditLimit,
      isBlacklisted: this.selectedPassager.isBlacklisted
    };

    this.passengerService.update(targetKey, payload)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          modal.close();
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'success', title: 'Passager mis à jour avec succès.'
          });
          this.loadPassagers();
        },
        error: (err: any) => {
          this.isSaving = false;
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'error', title: err.error?.message || 'Erreur lors de la mise à jour.'
          });
        }
      });
  }

  validateKyc(passager: PassengerItem, status: string): void {
    const targetKey = passager.uuid || (passager.id ? String(passager.id) : null);
    if (!targetKey) return;

    if (status === 'REJECTED') {
      Swal.fire({
        title: 'Rejeter le dossier KYC ?',
        text: 'Veuillez indiquer le motif du rejet qui sera notifié au passager :',
        input: 'text',
        inputPlaceholder: 'Ex: Photo selfie floue, pièce d\'identité illisible...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmer le rejet',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#dc3545',
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return 'Veuillez préciser le motif du rejet !';
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          this.executeVerifyKyc(targetKey, status, result.value);
        }
      });
    } else {
      Swal.fire({
        title: 'Approuver les pièces KYC ?',
        text: 'Le passager sera certifié et pourra effectuer des demandes de crédit voyage.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, approuver',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#198754'
      }).then((result) => {
        if (result.isConfirmed) {
          this.executeVerifyKyc(targetKey, status);
        }
      });
    }
  }

  private executeVerifyKyc(targetKey: string, status: string, reason?: string): void {
    this.passengerService.verifyKyc(targetKey, status, reason)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: () => {
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3500,
            icon: 'success',
            title: status === 'VERIFIED'
              ? 'Pièces KYC approuvées ! Une notification a été envoyée au passager.'
              : 'Dossier KYC rejeté. Le motif a été notifié au passager.'
          });
          this.loadPassagers();
          if (this.selectedPassager) {
            this.selectedPassager.identityStatus = status;
            this.selectedPassager.isIdentified = (status === 'VERIFIED');
          }
        },
        error: (err: any) => {
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'error', title: err.error?.message || 'Erreur lors de la mise à jour du statut KYC.'
          });
        }
      });
  }

  getPassengerId(pass: PassengerItem): string {
    if (pass.code) return pass.code;
    if (pass.id) return 'PS-' + (1040 + Number(pass.id));
    return 'PS-1000';
  }

  getFullName(pass: PassengerItem): string {
    if (!pass) return '';
    if (pass.fullName) return pass.fullName;
    if (pass.nom) return pass.nom;
    if (pass.firstname || pass.lastname) return `${pass.firstname || ''} ${pass.lastname || ''}`.trim();
    return 'Passager Inconnu';
  }

  getInscriptionDateParts(pass: PassengerItem): { date: string; time: string } {
    if (!pass) return { date: '-', time: '' };
    const rawDate = pass.createdAt || pass.inscription;
    if (rawDate && rawDate !== 'Récemment') {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return {
            date: `${day}/${month}/${year}`,
            time: `${hours}:${minutes}`
          };
        }
      } catch (e) {}

      if (typeof rawDate === 'string') {
        const trimmed = rawDate.trim();
        if (trimmed.includes(' ')) {
          const parts = trimmed.split(' ');
          return { date: parts[0], time: parts[1] || '' };
        }
        if (trimmed.includes('T')) {
          const [datePart, timePart] = trimmed.split('T');
          const dp = datePart.split('-');
          if (dp.length === 3) {
            return {
              date: `${dp[2]}/${dp[1]}/${dp[0]}`,
              time: timePart ? timePart.substring(0, 5) : ''
            };
          }
        }
        return { date: trimmed, time: '' };
      }
    }
    return { date: '19/08/2026', time: '' };
  }

  getInscriptionDate(pass: PassengerItem): string {
    const parts = this.getInscriptionDateParts(pass);
    return parts.time ? `${parts.date} ${parts.time}` : parts.date;
  }

  getPassengerStatusInfo(pass: PassengerItem): { label: string; bgClass: string } {
    const idStatus = (pass.identityStatus || '').toUpperCase();
    let label = 'Compte Créé';
    let bgClass = 'bg-secondary text-white';

    if (idStatus === 'VERIFIED' || idStatus === 'APPROVED' || idStatus === 'VALIDATED' || pass.isIdentified || pass.statut === 'Vérifié') {
      label = 'Vérifié';
      bgClass = 'bg-success text-white';
    } else if (idStatus === 'PENDING' || idStatus === 'SUBMITTED' || pass.statut === 'En attente KYC') {
      label = 'En attente KYC';
      bgClass = 'bg-warning text-dark';
    } else if (idStatus === 'REJECTED' || idStatus === 'REFUSED' || pass.statut === 'KYC Rejeté') {
      label = 'KYC Rejeté';
      bgClass = 'bg-danger text-white';
    }

    if (pass.isBlacklisted) {
      bgClass = 'bg-danger text-white';
      label = `${label} 🔒`;
    }

    return { label, bgClass };
  }

  toggleBlacklist(pass: PassengerItem): void {
    if (!pass || !pass.uuid) return;

    const isBlocking = !pass.isBlacklisted;
    const name = this.getFullName(pass);

    Swal.fire({
      title: isBlocking ? 'Bloquer ce passager ?' : 'Débloquer ce passager ?',
      text: isBlocking
        ? `Êtes-vous sûr de vouloir bloquer ${name} ? Le passager ne pourra plus effectuer de demande de crédit.`
        : `Êtes-vous sûr de vouloir débloquer ${name} ? Le passager pourra à nouveau utiliser les services.`,
      icon: isBlocking ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: isBlocking ? '#dc3545' : '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: isBlocking ? 'Oui, bloquer' : 'Oui, débloquer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.passengerService.toggleBlacklist(pass.uuid!).subscribe({
          next: (res: any) => {
            pass.isBlacklisted = !pass.isBlacklisted;
            Swal.fire({
              title: isBlocking ? 'Passager bloqué' : 'Passager débloqué',
              text: res?.message || (isBlocking ? 'Le compte a été suspendu avec succès.' : 'Le compte a été réactivé avec succès.'),
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadPassagers();
          },
          error: (err: any) => {
            console.error('Erreur lors du blocage/déblocage:', err);
            Swal.fire('Erreur', 'Une erreur est survenue lors du traitement.', 'error');
          }
        });
      }
    });
  }

  getKycStatusLabel(status?: string): string {
    switch (status) {
      case 'VERIFIED': return 'Validé ✅';
      case 'PENDING': return 'En examen ⏳';
      case 'REJECTED': return 'Rejeté ❌';
      default: return 'Non soumis';
    }
  }

  getImageUrl(url?: string, type: 'avatar' | 'doc' = 'avatar'): string {
    if (!url || url.trim() === '') {
      return type === 'avatar' ? this.defaultAvatar : this.defaultDocPlaceholder;
    }
    if (url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/data/user/') || url.includes('/com.example.') || url.startsWith('file://')) {
      return type === 'avatar' ? this.defaultAvatar : this.defaultDocPlaceholder;
    }
    if (url.startsWith('/')) {
      return 'http://localhost:8000' + url;
    }
    return url;
  }

  onImgError(event: any, type: 'avatar' | 'doc' = 'avatar'): void {
    event.target.src = type === 'avatar' ? this.defaultAvatar : this.defaultDocPlaceholder;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
