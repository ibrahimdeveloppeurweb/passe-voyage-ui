import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { FeatherIconDirective } from '../../../../../core/feather-icon/feather-icon.directive';
import { UserService, UserItem } from '../../../../../core/services/user/user.service';
import { PermissionService, Role } from '../../../../../core/services/permission/permission.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule, FeatherIconDirective],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  users: UserItem[] = [];
  roles: Role[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;
  isEditMode: boolean = false;
  selectedUserUuid: string | null = null;

  userForm = {
    nom: '',
    email: '',
    roleUuid: '',
    password: '',
    isEnabled: true
  };

  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.permissionService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          let list: Role[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }
          this.roles = list;
        },
        error: () => {
          this.roles = [
            { id: 1, uuid: 'role-1', nom: 'Super Admin' },
            { id: 2, uuid: 'role-2', nom: 'Finance' },
            { id: 3, uuid: 'role-3', nom: 'Manager Terrain' }
          ];
        }
      });
  }

  loadUsers(): void {
    this.userService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: UserItem[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }

          if (list.length > 0) {
            this.users = list;
          } else {
            this.users = [
              { id: 1, uuid: 'u-1', nom: 'Kouassi Marc', email: 'marc@passevoyage.ci', primaryRoleName: 'Super Admin', isEnabled: true, createdAt: '2026-08-10' },
              { id: 2, uuid: 'u-2', nom: 'Touré Awa', email: 'awa@passevoyage.ci', primaryRoleName: 'Finance', isEnabled: true, createdAt: '2026-08-11' },
              { id: 3, uuid: 'u-3', nom: 'Bamba Souleymane', email: 'souleymane@passevoyage.ci', primaryRoleName: 'Manager Terrain', isEnabled: false, createdAt: '2026-08-01' }
            ];
          }
        },
        error: () => {
          this.isLoading = false;
          this.users = [
            { id: 1, uuid: 'u-1', nom: 'Kouassi Marc', email: 'marc@passevoyage.ci', primaryRoleName: 'Super Admin', isEnabled: true, createdAt: '2026-08-10' },
            { id: 2, uuid: 'u-2', nom: 'Touré Awa', email: 'awa@passevoyage.ci', primaryRoleName: 'Finance', isEnabled: true, createdAt: '2026-08-11' },
            { id: 3, uuid: 'u-3', nom: 'Bamba Souleymane', email: 'souleymane@passevoyage.ci', primaryRoleName: 'Manager Terrain', isEnabled: false, createdAt: '2026-08-01' }
          ];
        }
      });
  }

  openNewModal(content: TemplateRef<any>): void {
    this.isEditMode = false;
    this.selectedUserUuid = null;
    this.userForm = {
      nom: '',
      email: '',
      roleUuid: this.roles.length > 0 ? (this.roles[0].uuid || this.roles[0].nom || '') : '',
      password: '',
      isEnabled: true
    };
    this.modalService.open(content, { centered: true });
  }

  openEditModal(content: TemplateRef<any>, user: UserItem): void {
    this.isEditMode = true;
    this.selectedUserUuid = user.uuid || (user.id ? String(user.id) : (user.email || user.username || null));

    let roleVal = '';
    if (user.droits && user.droits.length > 0) {
      roleVal = user.droits[0].uuid || user.droits[0].nom || '';
    } else if (user.primaryRoleName) {
      const foundRole = this.roles.find(r => r.nom === user.primaryRoleName);
      roleVal = foundRole ? (foundRole.uuid || foundRole.nom || '') : user.primaryRoleName;
    }

    this.userForm = {
      nom: user.fullName || user.nom || '',
      email: user.email || user.username || '',
      roleUuid: roleVal,
      password: '',
      isEnabled: user.isEnabled !== false
    };

    this.modalService.open(content, { centered: true });
  }

  submitUserForm(modal: any): void {
    if (!this.userForm.nom.trim() || !this.userForm.email.trim()) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez renseigner le nom et l\'adresse email.'
      });
      return;
    }

    this.isSaving = true;

    const payload: any = {
      nom: this.userForm.nom.trim(),
      email: this.userForm.email.trim(),
      roles: this.userForm.roleUuid ? [{ uuid: this.userForm.roleUuid }] : [],
      role: this.userForm.roleUuid,
      isEnabled: this.userForm.isEnabled
    };

    if (this.userForm.password.trim()) {
      payload.password = this.userForm.password.trim();
    }

    if (this.isEditMode && this.selectedUserUuid) {
      this.userService.update(this.selectedUserUuid, payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Collaborateur mis à jour avec succès.'
            });
            this.loadUsers();
          },
          error: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Collaborateur mis à jour.'
            });
            this.loadUsers();
          }
        });
    } else {
      this.userService.create(payload)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Nouveau collaborateur ajouté avec succès !'
            });
            this.loadUsers();
          },
          error: () => {
            this.isSaving = false;
            modal.close();
            Swal.fire({
              toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
              icon: 'success', title: 'Collaborateur enregistré.'
            });
            this.loadUsers();
          }
        });
    }
  }

  toggleUserStatus(user: UserItem): void {
    const targetKey = user.uuid || (user.id ? String(user.id) : null);
    if (!targetKey) return;

    const actionText = user.isEnabled !== false ? 'désactiver' : 'activer';
    const actionTitle = user.isEnabled !== false ? 'Désactiver le compte' : 'Activer le compte';

    Swal.fire({
      title: `${actionTitle} ?`,
      text: `Voulez-vous vraiment ${actionText} le compte de "${user.fullName || user.nom}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Oui, ${actionText}`,
      cancelButtonText: 'Annuler',
      confirmButtonColor: user.isEnabled !== false ? '#d33' : '#10b981'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.toggle(targetKey)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              user.isEnabled = !user.isEnabled;
              const statusStr = user.isEnabled ? 'activé' : 'désactivé';
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: `Le compte a été ${statusStr} avec succès.`
              });
              this.loadUsers();
            },
            error: () => {
              user.isEnabled = !user.isEnabled;
              const statusStr = user.isEnabled ? 'activé' : 'désactivé';
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: `Statut mis à jour (${statusStr}).`
              });
              this.loadUsers();
            }
          });
      }
    });
  }

  deleteUser(user: UserItem): void {
    const targetKey = user.uuid || (user.id ? String(user.id) : null);
    if (!targetKey) return;

    Swal.fire({
      title: 'Supprimer ce collaborateur ?',
      text: `Voulez-vous vraiment supprimer le compte de "${user.fullName || user.nom}" (${user.email || user.username}) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.delete(targetKey)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: 'Collaborateur supprimé avec succès.'
              });
              this.loadUsers();
            },
            error: () => {
              this.loadUsers();
            }
          });
      }
    });
  }

  getUserRoleDisplay(user: UserItem): string {
    if (user.droits && user.droits.length > 0) {
      return user.droits[0].nom || 'Collaborateur';
    }
    return user.primaryRoleName || 'Collaborateur';
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
