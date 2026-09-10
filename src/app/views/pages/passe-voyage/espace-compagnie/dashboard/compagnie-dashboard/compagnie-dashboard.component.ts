import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../../../../../../core/services/company/company.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compagnie-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './compagnie-dashboard.component.html',
  styleUrl: './compagnie-dashboard.component.scss'
})
export class CompagnieDashboardComponent implements OnInit {

  loading: boolean = true;

  // KPI Dynamic Data
  totalSalesFormatted: string = '0 XOF';
  totalTickets: number = 0;
  activeAgents: number = 0;
  activeStations: number = 0;

  recentActivities: any[] = [];
  topStationPerformance: any = null;

  selectedPeriod: string = 'all';

  constructor(private companyService: CompanyService) { }

  ngOnInit(): void {
    this.fetchDashboard();
  }

  onPeriodChange(event: any): void {
    this.selectedPeriod = event.target.value;
    this.fetchDashboard();
  }

  fetchDashboard() {
    this.loading = true;
    const filters = { period: this.selectedPeriod };
    this.companyService.getEspaceDashboard(filters).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.totalSalesFormatted = new Intl.NumberFormat('fr-FR').format(data.totalSales) + ' XOF';
        this.totalTickets = data.totalTickets || 0;
        this.activeAgents = data.activeAgents || 0;
        this.activeStations = data.activeStations || 0;
        
        this.recentActivities = data.recentActivities || [];
        this.topStationPerformance = data.topStationPerformance || null;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger le tableau de bord.', 'error');
      }
    });
  }

}
