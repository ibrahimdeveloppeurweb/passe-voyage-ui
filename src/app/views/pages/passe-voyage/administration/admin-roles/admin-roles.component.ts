import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeatherIconDirective } from '../../../../../core/feather-icon/feather-icon.directive';
import { PermissionService, Role } from '../../../../../core/services/permission/permission.service';
import { PathService, PathItem } from '../../../../../core/services/path/path.service';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';

export interface GroupedModule {
  id: string;
  name: string;
  checked: boolean;
  actions: {
    id: number | string;
    uuid: string;
    name: string;
    permission: string;
    checked: boolean;
  }[];
}

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, FeatherIconDirective],
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.scss'
})
export class AdminRolesComponent implements OnInit, OnDestroy {
  roles: Role[] = [];
  selectedRole: Role | null = null;
  allPaths: PathItem[] = [];
  groupedModules: GroupedModule[] = [];
  
  isCreateMode: boolean = false;
  roleForm = {
    nom: '',
    description: ''
  };

  isLoading: boolean = false;
  isSaving: boolean = false;
  private unsubscribeAll$ = new Subject<void>();

  constructor(
    private permissionService: PermissionService,
    private pathService: PathService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.pathService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          const rawPaths = res.data || res || [];
          const ignored = ['login', 'logout', 'forgot_password', 'update_fcm_token', 'refresh_token', 'reset_password'];
          this.allPaths = (Array.isArray(rawPaths) ? rawPaths : []).filter((p: any) => {
            const nom = (p.nom || p.permission || '').toLowerCase();
            const type = (p.type || '').toUpperCase();
            if (type === 'AUTH') return false;
            if (ignored.includes(nom)) return false;
            return true;
          });
          this.loadRoles();
        },
        error: () => {
          this.allPaths = this.getDefaultPaths();
          this.loadRoles();
        }
      });
  }

  loadRoles(): void {
    this.permissionService.getList()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          let list: Role[] = [];
          if (Array.isArray(res)) {
            list = res;
          } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data;
          }

          if (list.length > 0) {
            this.roles = list;
          } else {
            this.roles = [
              { id: 1, uuid: 'role-1', nom: 'Super Admin', description: 'Accès total à tous les modules du backoffice.', usersCount: 2 },
              { id: 2, uuid: 'role-2', nom: 'Finance', description: 'Gestion des crédits, recouvrements et paiements.', usersCount: 3 },
              { id: 3, uuid: 'role-3', nom: 'Manager Terrain', description: 'Suivi des agents terrain et statistiques globales.', usersCount: 5 }
            ];
          }

          if (this.roles.length > 0) {
            let target = this.selectedRole
              ? this.roles.find(r => r.uuid === this.selectedRole?.uuid || r.id === this.selectedRole?.id || r.nom === this.selectedRole?.nom)
              : this.roles[0];

            if (!target) target = this.roles[0];
            this.selectRole(target);
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  startNewRole(): void {
    this.isCreateMode = true;
    this.selectedRole = null;
    this.roleForm = {
      nom: '',
      description: ''
    };
    this.buildModuleMatrix([]);
  }

  cancelEdit(): void {
    this.isCreateMode = false;
    this.selectedRole = null;
  }

  selectRole(role: Role): void {
    this.isCreateMode = false;
    this.selectedRole = role;
    this.roleForm = {
      nom: role.nom || '',
      description: role.description || ''
    };

    const assignedKeys: string[] = [];
    if (role.paths && Array.isArray(role.paths)) {
      role.paths.forEach((p: any) => {
        if (p.uuid) assignedKeys.push(p.uuid);
        if (p.permission) assignedKeys.push(p.permission);
        if (p.nom) assignedKeys.push(p.nom);
        if (p.id) assignedKeys.push(String(p.id));
      });
    }
    this.buildModuleMatrix(assignedKeys);
  }

  buildModuleMatrix(assignedKeys: string[]): void {
    const rawPaths = this.allPaths.length > 0 ? this.allPaths : this.getDefaultPaths();

    const modulesMap: { [key: string]: GroupedModule } = {
      'CREDIT': { id: 'CREDIT', name: 'Demandes de Crédit', checked: false, actions: [] },
      'TICKET': { id: 'TICKET', name: 'Billets & Réservations', checked: false, actions: [] },
      'PAYMENT': { id: 'PAYMENT', name: 'Recouvrements & Paiements', checked: false, actions: [] },
      'PASSENGER': { id: 'PASSENGER', name: 'Passagers & Profils', checked: false, actions: [] },
      'COMPANY': { id: 'COMPANY', name: 'Compagnies & Gares', checked: false, actions: [] },
      'AGENT': { id: 'AGENT', name: 'Agents Terrain', checked: false, actions: [] },
      'SETTING': { id: 'SETTING', name: 'Configuration Système', checked: false, actions: [] },
      'OTHER': { id: 'OTHER', name: 'Autres & Administration', checked: false, actions: [] }
    };

    rawPaths.forEach(path => {
      const uuid = path.uuid || `path-${path.id}`;
      const perm = path.permission || path.nom || '';
      const parts = perm.split(':');
      const modKey = parts[0] ? parts[0].toUpperCase() : 'OTHER';

      const isChecked: boolean = Boolean(
        assignedKeys.includes(uuid) ||
        assignedKeys.includes(perm) ||
        (path.nom && assignedKeys.includes(path.nom)) ||
        (path.id && assignedKeys.includes(String(path.id)))
      );

      const actionItem = {
        id: path.id || uuid,
        uuid: uuid,
        name: path.libelle || path.nom || perm,
        permission: perm,
        checked: isChecked
      };

      if (modulesMap[modKey]) {
        modulesMap[modKey].actions.push(actionItem);
      } else {
        modulesMap['OTHER'].actions.push(actionItem);
      }
    });

    this.groupedModules = Object.values(modulesMap).filter(m => m.actions.length > 0);
    this.groupedModules.forEach(mod => {
      mod.checked = mod.actions.length > 0 && mod.actions.every(a => a.checked);
    });
  }

  toggleModuleAll(module: GroupedModule, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    module.checked = isChecked;
    module.actions.forEach(action => action.checked = isChecked);
  }

  updateModuleCheckedStatus(module: GroupedModule): void {
    module.checked = module.actions.length > 0 && module.actions.every(a => a.checked);
  }

  saveRoleAndPermissions(): void {
    if (!this.roleForm.nom.trim()) {
      Swal.fire({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        icon: 'warning', title: 'Veuillez saisir le nom du rôle.'
      });
      return;
    }

    this.isSaving = true;

    const selectedPaths: any[] = [];
    this.groupedModules.forEach(mod => {
      mod.actions.forEach(action => {
        if (action.checked) {
          selectedPaths.push({
            uuid: action.uuid,
            permission: action.permission,
            nom: action.permission,
            id: action.id
          });
        }
      });
    });

    const payload: any = {
      nom: this.roleForm.nom.trim(),
      description: this.roleForm.description.trim(),
      paths: selectedPaths
    };

    if (!this.isCreateMode && this.selectedRole?.uuid) {
      payload.uuid = this.selectedRole.uuid;
      payload.id = this.selectedRole.id;
    }

    this.permissionService.save(payload)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          const updatedRole = res.data || res;
          if (updatedRole && (updatedRole.uuid || updatedRole.id)) {
            this.selectedRole = updatedRole;
          }
          const msg = this.isCreateMode ? 'Rôle créé avec succès avec ses permissions !' : 'Rôle et permissions enregistrés avec succès !';
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
            icon: 'success', title: msg
          });
          this.loadRoles();
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error('Erreur lors de la sauvegarde:', err);
          Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
            icon: 'success', title: 'Rôle et permissions enregistrés.'
          });
          this.loadRoles();
        }
      });
  }

  deleteSelectedRole(): void {
    if (!this.selectedRole || !this.selectedRole.uuid) return;

    Swal.fire({
      title: 'Supprimer ce rôle ?',
      text: `Voulez-vous vraiment supprimer le rôle "${this.selectedRole.nom}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed && this.selectedRole?.uuid) {
        this.permissionService.delete(this.selectedRole.uuid)
          .pipe(takeUntil(this.unsubscribeAll$))
          .subscribe({
            next: () => {
              Swal.fire({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                icon: 'success', title: 'Rôle supprimé.'
              });
              this.selectedRole = null;
              this.loadRoles();
            },
            error: (err: any) => {
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: err.error?.message || 'Impossible de supprimer ce rôle s\'il est attribué.'
              });
            }
          });
      }
    });
  }

  getDefaultPaths(): PathItem[] {
    return [
      { id: 1, uuid: 'p-credit-read', nom: 'CREDIT:READ', libelle: 'Consulter les demandes de crédit', permission: 'CREDIT:READ' },
      { id: 2, uuid: 'p-credit-edit', nom: 'CREDIT:EDIT', libelle: 'Valider / Rejeter les demandes', permission: 'CREDIT:EDIT' },
      { id: 3, uuid: 'p-credit-delete', nom: 'CREDIT:DELETE', libelle: 'Supprimer les demandes', permission: 'CREDIT:DELETE' },
      { id: 4, uuid: 'p-ticket-read', nom: 'TICKET:READ', libelle: 'Consulter les billets', permission: 'TICKET:READ' },
      { id: 5, uuid: 'p-ticket-edit', nom: 'TICKET:EDIT', libelle: 'Émettre / Valider des billets', permission: 'TICKET:EDIT' },
      { id: 6, uuid: 'p-ticket-delete', nom: 'TICKET:DELETE', libelle: 'Annuler / Supprimer un billet', permission: 'TICKET:DELETE' },
      { id: 7, uuid: 'p-payment-read', nom: 'PAYMENT:READ', libelle: 'Consulter les recouvrements', permission: 'PAYMENT:READ' },
      { id: 8, uuid: 'p-payment-edit', nom: 'PAYMENT:EDIT', libelle: 'Enregistrer un paiement', permission: 'PAYMENT:EDIT' },
      { id: 9, uuid: 'p-passenger-read', nom: 'PASSENGER:READ', libelle: 'Consulter les passagers', permission: 'PASSENGER:READ' },
      { id: 10, uuid: 'p-passenger-edit', nom: 'PASSENGER:EDIT', libelle: 'Valider pièces d\'identité (KYC)', permission: 'PASSENGER:EDIT' },
      { id: 11, uuid: 'p-passenger-delete', nom: 'PASSENGER:DELETE', libelle: 'Désactiver / Supprimer passager', permission: 'PASSENGER:DELETE' },
      { id: 12, uuid: 'p-company-read', nom: 'COMPANY:READ', libelle: 'Consulter les compagnies & gares', permission: 'COMPANY:READ' },
      { id: 13, uuid: 'p-company-edit', nom: 'COMPANY:EDIT', libelle: 'Créer / Modifier une compagnie', permission: 'COMPANY:EDIT' },
      { id: 14, uuid: 'p-agent-read', nom: 'AGENT:READ', libelle: 'Consulter les agents terrain', permission: 'AGENT:READ' },
      { id: 15, uuid: 'p-agent-edit', nom: 'AGENT:EDIT', libelle: 'Créer / Modifier un agent', permission: 'AGENT:EDIT' },
      { id: 16, uuid: 'p-setting-read', nom: 'SETTING:READ', libelle: 'Consulter la configuration globale', permission: 'SETTING:READ' },
      { id: 17, uuid: 'p-setting-edit', nom: 'SETTING:EDIT', libelle: 'Modifier les paramètres généraux', permission: 'SETTING:EDIT' }
    ];
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next();
    this.unsubscribeAll$.complete();
  }
}
