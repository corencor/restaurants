import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-restaurant-table',
  templateUrl: './restaurant-table.component.html',
  styleUrls: ['./restaurant-table.component.css']
})
export class RestaurantTableComponent implements OnInit {

  searchQuery: string = '';
  sortColumn: string = '';
  sortDirection: string = 'asc'; // 'asc' for ascending, 'desc' for descending

  restaurants: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>('/assets/restaurants.json').subscribe(data => {
      this.restaurants = data;
    });
  }

  get filteredRestaurants() {
    let filtered = this.restaurants.filter(restaurant => {
      const nameMatches = restaurant.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const typeMatches = restaurant.type ? restaurant.type.toLowerCase().includes(this.searchQuery.toLowerCase()) : false;
      return nameMatches || typeMatches;
    });

    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];

        let comparison = 0;
        if (valueA > valueB) {
          comparison = 1;
        } else if (valueA < valueB) {
          comparison = -1;
        }

        // Secondary sorting by reviews if the primary sort is by rating
        if (comparison === 0 && this.sortColumn === 'rating') {
          const secondaryValueA = a['reviews'];
          const secondaryValueB = b['reviews'];

          if (secondaryValueA > secondaryValueB) {
            comparison = 1;
          } else if (secondaryValueA < secondaryValueB) {
            comparison = -1;
          }
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
}
