import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouteService, RouteItem } from '../../../../../core/services/route/route.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ref-trajets',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './ref-trajets.component.html',
  styleUrl: './ref-trajets.component.scss'
})
export class RefTrajetsComponent implements OnInit, OnDestroy {
  trajets: RouteItem[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditMode: boolean = false;
  selectedTrajetUuid: string | null = null;

  trajetForm: any = {
    depart: '',
    arrivee: '',
    distance: '',
    statut: 'Actif'
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private routeService: RouteService
  ) {}

  ngOnInit(): void {
    this.loadTrajets();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }

  loadTrajets(): void {
    this.isLoading = true;
    this.routeService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (Array.isArray(res)) {
            this.trajets = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            this.trajets = res.data;
          } else {
            this.trajets = [];
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Erreur chargement trajets:', err);
        }
      });
  }

  openNewModal(content: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedTrajetUuid = null;
    this.trajetForm = {
      depart: '',
      arrivee: '',
      distance: '',
      statut: 'Actif'
    };
    this.modalService.open(content, { centered: true });
  }

  openEditModal(content: TemplateRef<any>, trajet: RouteItem): void {
    this.isEditMode = true;
    this.selectedTrajetUuid = trajet.uuid || (trajet.id ? String(trajet.id) : null);

    this.trajetForm = {
      depart: trajet.villeDepart || trajet.departureCity || '',
      arrivee: trajet.villeArrivee || trajet.arrivalCity || '',
      distance: trajet.distance || '',
      statut: trajet.statut || (trajet.isActive ? 'Actif' : 'Inactif')
    };
    this.modalService.open(content, { centered: true });
  }

  submitTrajetForm(modal: any): void {
    const departName = (this.trajetForm.depart || '').trim().toUpperCase();
    const arriveeName = (this.trajetForm.arrivee || '').trim().toUpperCase();
    const distanceVal = (this.trajetForm.distance || '').trim();

    if (!departName) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez renseigner la ville de départ.'
      });
      return;
    }

    if (!arriveeName) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez renseigner la ville d\'arrivée.'
      });
      return;
    }

    this.isSaving = true;

    const payload: any = {
      villeDepart: departName,
      departureCity: departName,
      villeArrivee: arriveeName,
      arrivalCity: arriveeName,
      distance: distanceVal,
      statut: this.trajetForm.statut,
      isActive: this.trajetForm.statut === 'Actif'
    };

    if (this.isEditMode && this.selectedTrajetUuid) {
      this.routeService.update(this.selectedTrajetUuid, payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            this.isSaving = false;
            modal.close('save');
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: res.message || 'Trajet modifié avec succès.'
            });
            this.loadTrajets();
          },
          error: (err: any) => {
            this.isSaving = false;
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
              icon: 'error', title: err.error?.message || 'Erreur lors de la modification du trajet.'
            });
          }
        });
    } else {
      this.routeService.create(payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: (res: any) => {
            this.isSaving = false;
            modal.close('save');
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: res.message || 'Trajet créé avec succès.'
            });
            this.loadTrajets();
          },
          error: (err: any) => {
            this.isSaving = false;
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
              icon: 'error', title: err.error?.message || 'Erreur lors de la création du trajet.'
            });
          }
        });
    }
  }

  toggleTrajetStatus(trajet: RouteItem): void {
    const targetUuid = trajet.uuid || (trajet.id ? String(trajet.id) : null);
    if (!targetUuid) return;

    this.routeService.toggle(targetUuid)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
            icon: 'success', title: res.message || 'Statut du trajet mis à jour.'
          });
          this.loadTrajets();
        },
        error: (err: any) => {
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
            icon: 'error', title: err.error?.message || 'Erreur lors du changement de statut.'
          });
        }
      });
  }

  deleteTrajet(trajet: RouteItem): void {
    const targetUuid = trajet.uuid || (trajet.id ? String(trajet.id) : null);
    if (!targetUuid) return;

    const dep = trajet.villeDepart || trajet.departureCity || 'Départ';
    const arr = trajet.villeArrivee || trajet.arrivalCity || 'Arrivée';

    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer le trajet ${dep} ➔ ${arr} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.routeService.delete(targetUuid)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: (res: any) => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: res.message || 'Trajet supprimé avec succès.'
              });
              this.loadTrajets();
            },
            error: (err: any) => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 4000,
                icon: 'error', title: err.error?.message || 'Erreur lors de la suppression.'
              });
            }
          });
      }
    });
  }
}
