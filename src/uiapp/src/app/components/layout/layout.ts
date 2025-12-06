import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { Place } from '../../place/place';
import { OVERVIEW_PLACE } from '../../place/overview.place';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterOutlet,
    RouterLink,
    MatListModule
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent implements OnInit {
  sideNavPlaces: Place[] = [];

  constructor(private renderer: Renderer2, private themeService: ThemeService) {
    const allPlaces: Place[] = [
      OVERVIEW_PLACE,
      // Add other places here as they are created
    ];
    this.sideNavPlaces = allPlaces.filter(place => place.showInSideNav);
  }

  ngOnInit() {
    this.themeService.isDarkTheme$.subscribe(isDarkTheme => {
      if (isDarkTheme) {
        this.renderer.addClass(document.body, 'dark-theme');
      } else {
        this.renderer.removeClass(document.body, 'dark-theme');
      }
    });
  }
}
