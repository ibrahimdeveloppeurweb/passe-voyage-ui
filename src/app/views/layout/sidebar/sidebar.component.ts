import { DOCUMENT, NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { NgScrollbar } from 'ngx-scrollbar';
import MetisMenu from 'metismenujs';

import { MENU } from './menu';
import { MenuItem } from './menu.model';

import { FeatherIconDirective } from '../../../core/feather-icon/feather-icon.directive';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    NgScrollbar, 
    NgClass, 
    FeatherIconDirective, 
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, AfterViewInit {

  @ViewChild('sidebarToggler') sidebarToggler: ElementRef;

  menuItems: MenuItem[] = [];
  @ViewChild('sidebarMenu') sidebarMenu: ElementRef;

  constructor(
    @Inject(DOCUMENT) private document: Document, 
    private renderer: Renderer2, 
    router: Router,
    private authService: AuthService
  ) { 
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {

        /**
         * Activating the current active item dropdown
         */
        this._activateMenuDropdown();

        /**
         * closing the sidebar
         */
        if (window.matchMedia('(max-width: 991px)').matches) {
          this.document.body.classList.remove('sidebar-open');
        }

      }
    });
  }

  ngOnInit(): void {
    const userPermissions = this.authService.getPermissions();
    
    // 1. Filtrer les menus et sous-menus en fonction de la permission
    const rawFiltered: MenuItem[] = [];
    
    MENU.forEach(item => {
      let hasAccess = false;
      if (!item.permission) {
        hasAccess = true; // isTitle (no permission)
      } else {
        hasAccess = userPermissions.includes(item.permission);
      }

      // Copier l'item pour ne pas modifier la constante globale MENU
      const clonedItem = { ...item };

      if (clonedItem.label === 'Espace Compagnie') {
        const companyName = this.authService.getCompanyName();
        if (companyName) {
           clonedItem.label = companyName.toUpperCase();
        }
      }

      if (clonedItem.subItems) {
        clonedItem.subItems = clonedItem.subItems.filter((sub: any) => {
          if (!sub.permission) return true;
          return userPermissions.includes(sub.permission);
        });
        
        // Si l'utilisateur a accès à au moins un sous-menu, on affiche le parent obligatoirement !
        if (clonedItem.subItems.length > 0) {
          hasAccess = true;
        }
      }

      if (hasAccess) {
        // Ne pas ajouter les parents vides (sauf les titres, traités au nettoyage final)
        if (clonedItem.subItems && clonedItem.subItems.length === 0) {
          // Si c'est un parent et qu'il n'y a plus de subItems après filtrage, on le cache
          return;
        }
        rawFiltered.push(clonedItem);
      }
    });

    // 2. Nettoyer les Titres vides (ex: si aucun sous-menu d'un module n'est visible)
    const finalFiltered: MenuItem[] = [];
    for (let i = 0; i < rawFiltered.length; i++) {
        const item = rawFiltered[i];
        if (item.isTitle) {
            let hasChild = false;
            for(let j = i + 1; j < rawFiltered.length; j++) {
                if (rawFiltered[j].isTitle) break;
                hasChild = true;
                break;
            }
            if (hasChild) finalFiltered.push(item);
        } else {
            finalFiltered.push(item);
        }
    }
    
    this.menuItems = finalFiltered;

    /**
     * Sidebar-folded on desktop (min-width:992px and max-width: 1199px)
     */
    const desktopMedium = window.matchMedia('(min-width:992px) and (max-width: 1199px)');
    desktopMedium.addEventListener('change', () => {
      this.iconSidebar;
    });
    this.iconSidebar(desktopMedium);
  }

  ngAfterViewInit() {
    // activate menu items
    new MetisMenu(this.sidebarMenu.nativeElement);
    
    this._activateMenuDropdown();
  }

  /**
   * Toggle the sidebar when the hamburger button is clicked
   */
  toggleSidebar(e: Event) {
    this.sidebarToggler.nativeElement.classList.toggle('active');
    if (window.matchMedia('(min-width: 992px)').matches) {
      e.preventDefault();
      this.document.body.classList.toggle('sidebar-folded');
    } else if (window.matchMedia('(max-width: 991px)').matches) {
      e.preventDefault();
      this.document.body.classList.toggle('sidebar-open');
    }
  }


  /**
   * Open the sidebar on hover when it is in a folded state
   */
  operSidebarFolded() {
    if (this.document.body.classList.contains('sidebar-folded')){
      this.document.body.classList.add("open-sidebar-folded");
    }
  }


  /**
   * Fold sidebar after mouse leave (in folded state)
   */
  closeSidebarFolded() {
    if (this.document.body.classList.contains('sidebar-folded')){
      this.document.body.classList.remove("open-sidebar-folded");
    }
  }

  /**
   * Sidebar folded on desktop screens with a width between 992px and 1199px
   */
  iconSidebar(mq: MediaQueryList) {
    if (mq.matches) {
      this.document.body.classList.add('sidebar-folded');
    } else {
      this.document.body.classList.remove('sidebar-folded');
    }
  }


  /**
   * Returns true or false depending on whether the given menu item has a child
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }


  /**
   * Reset the menus, then highlight the currently active menu item
   */
  _activateMenuDropdown() {
    this.resetMenuItems();
    this.activateMenuItems();
  }


  /**
   * Resets the menus
   */
  resetMenuItems() {

    const links = document.getElementsByClassName('nav-link-ref');
    
    for (let i = 0; i < links.length; i++) {
      const menuItemEl = links[i];
      menuItemEl.classList.remove('mm-active');
      const parentEl = menuItemEl.parentElement;

      if (parentEl) {
          parentEl.classList.remove('mm-active');
          const parent2El = parentEl.parentElement;
          
          if (parent2El) {
            parent2El.classList.remove('mm-show');
          }

          const parent3El = parent2El?.parentElement;
          if (parent3El) {
            parent3El.classList.remove('mm-active');

            if (parent3El.classList.contains('side-nav-item')) {
              const firstAnchor = parent3El.querySelector('.side-nav-link-a-ref');

              if (firstAnchor) {
                firstAnchor.classList.remove('mm-active');
              }
            }

            const parent4El = parent3El.parentElement;
            if (parent4El) {
              parent4El.classList.remove('mm-show');

              const parent5El = parent4El.parentElement;
              if (parent5El) {
                parent5El.classList.remove('mm-active');
              }
            }
          }
      }
    }
  };


  /**
   * Toggles the state of the menu items
   */
  activateMenuItems() {

    const links: any = document.getElementsByClassName('nav-link-ref');

    let menuItemEl = null;
    
    for (let i = 0; i < links.length; i++) {
      // tslint:disable-next-line: no-string-literal
        if (window.location.pathname === links[i]['pathname']) {
          
            menuItemEl = links[i];
            
            break;
        }
    }

    if (menuItemEl) {
        menuItemEl.classList.add('mm-active');
        const parentEl = menuItemEl.parentElement;

        if (parentEl) {
            parentEl.classList.add('mm-active');

            const parent2El = parentEl.parentElement;
            if (parent2El) {
                parent2El.classList.add('mm-show');
            }

            const parent3El = parent2El.parentElement;
            if (parent3El) {
                parent3El.classList.add('mm-active');

                if (parent3El.classList.contains('side-nav-item')) {
                    const firstAnchor = parent3El.querySelector('.side-nav-link-a-ref');

                    if (firstAnchor) {
                        firstAnchor.classList.add('mm-active');
                    }
                }

                const parent4El = parent3El.parentElement;
                if (parent4El) {
                    parent4El.classList.add('mm-show');

                    const parent5El = parent4El.parentElement;
                    if (parent5El) {
                        parent5El.classList.add('mm-active');
                    }
                }
            }
        }
    }
  };


}
