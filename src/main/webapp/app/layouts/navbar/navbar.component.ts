import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {EventManager, JhiLanguageService} from 'ng-jhipster';

import {ProfileService} from '../profiles/profile.service';
import {GrantService, JhiLanguageHelper, LoginModalService, LoginService, Principal} from '../../shared';
import {ProfilesModalService} from '../../account/profiles/profiles-modal.service';

declare const ga: Function;

import {VERSION} from '../../app.constants';

@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: [
        'navbar.scss'
    ]
})
export class NavbarComponent implements OnInit {

    public static url: any;
    inProduction: boolean;
    isSearch = false;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;
    version: string;
    search: string;
    count: Number;

    constructor(private eventManager: EventManager,
                private loginService: LoginService,
                private languageHelper: JhiLanguageHelper,
                private languageService: JhiLanguageService,
                private principal: Principal,
                private loginModalService: LoginModalService,
                private profilesModalService: ProfilesModalService,
                private profileService: ProfileService,
                private grantService: GrantService,
                private router: Router) {
        this.version = VERSION ? 'v' + VERSION : '';
        this.isNavbarCollapsed = true;
        this.languageService.addLocation('home');
        this.router.events.subscribe((val: any) => {
            NavbarComponent.url = val.url;
        });
        this.grantService.count().subscribe((count) => {
            this.count = count;
        });
        document.addEventListener('click', this.offClickHandler.bind(this));
    }

    offClickHandler(event: any) {
        if (this.isSearch &&
            event.target !== document.getElementById('search-nav-item') &&
            event.target !== document.getElementById('icon-show-search')) {
            this.isSearch = false;
        }
    }

    changeLanguageInit(languageKey) {
        if (window.innerWidth < 768) {
            if (window.navigator.language.indexOf('sv') !== -1) {
                this.languageService.changeLanguage('sv');
            } else {
                this.languageService.changeLanguage('en');
            }
        } else if (languageKey) {
            this.languageService.changeLanguage(languageKey);
        }
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            if (account) {
                this.changeLanguageInit(account.langKey);
            } else {
                this.changeLanguageInit(null);
            }
        });

        this.languageHelper.getAll().then((languages) => {
            this.languages = languages;
        });

        this.profileService.getProfileInfo().subscribe((profileInfo) => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });
    }

    searchWord() {
        if (this.search !== undefined && this.search !== '') {
            this.router.navigate(['../search', this.search],
                {replaceUrl: (NavbarComponent.url.indexOf('/search/') !== -1)});
        }
    }

    changeLanguage(languageKey: string) {
        this.languageService.changeLanguage(languageKey);
        this.eventManager.broadcast({
            name: 'changeLanguage',
            content: languageKey
        });
        ga('send', 'event', 'language', 'change language to ' + languageKey);
    }

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    isHomepage() {
        return this.principal.isHomepage();
    }

    setShowFilter() {
        this.principal.setShowFilter();
    }

    isShowFilter() {
        return this.principal.isShowFilter();
    }

    isGrantpage() {
        return this.principal.isGrantpage();
    }

    login() {
        this.principal.setShowFilter(false);
        this.modalRef = this.loginModalService.open();
    }

    settings() {
        this.modalRef = this.profilesModalService.open();
    }

    logout() {
        this.collapseNavbar();
        this.loginService.logout();
        this.router.navigate(['']);
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }

    getImageUrl() {
        return this.isAuthenticated() ? this.principal.getImageUrl() : null;
    }

    setSearchTrue() {
        this.isSearch = true;
    }

    gotoGrants() {
        this.router.navigate(['grants']);
        ga('send', 'event', 'grants page', 'go to grantspage');
    }
}
