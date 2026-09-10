import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.scss'
})
export class FinancesComponent implements OnInit {

  searchTerm: string = '';
  typeFilter: string = '';
  loading: boolean = true;

  // KPI Dynamic Data
  fondsTotal: string = '0 XOF';
  soldeRestant: string = '0 XOF';
  consommation: string = '0 XOF';
  tauxUtilisation: string = '0%';
  tauxProgress: number = 0;

  transactions: any[] = [];
  filteredTransactions: any[] = [];

  constructor(private companyService: CompanyService) { }

  ngOnInit(): void {
    this.refreshData();
  }

  fetchFinances() {
    this.loading = true;
    this.companyService.getEspaceFinances().subscribe({
      next: (res: any) => {
        const data = res.data;
        this.fondsTotal = new Intl.NumberFormat('fr-FR').format(data.fondsTotal) + ' XOF';
        this.soldeRestant = new Intl.NumberFormat('fr-FR').format(data.soldeRestant) + ' XOF';
        this.consommation = new Intl.NumberFormat('fr-FR').format(data.consommation) + ' XOF';
        this.tauxUtilisation = data.tauxUtilisation + '%';
        this.tauxProgress = data.tauxUtilisation;
        
        this.transactions = data.transactions || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger vos données financières.', 'error');
      }
    });
  }

  applyFilters(): void {
    let result = [...this.transactions];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(t =>
        (t.ref && t.ref.toLowerCase().includes(term)) ||
        (t.desc && t.desc.toLowerCase().includes(term)) ||
        (t.author && t.author.toLowerCase().includes(term))
      );
    }

    if (this.typeFilter && this.typeFilter.trim() !== '') {
      if (this.typeFilter === 'Credits') {
        result = result.filter(t => t.typeBadge && t.typeBadge.includes('Crédit'));
      } else if (this.typeFilter === 'Debits') {
        result = result.filter(t => t.typeBadge && t.typeBadge.includes('Débit'));
      }
    }

    this.filteredTransactions = result;
  }

  refreshData(): void {
    this.searchTerm = '';
    this.typeFilter = '';
    this.fetchFinances();
  }
}
