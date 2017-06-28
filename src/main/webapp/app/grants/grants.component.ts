import {Component, OnDestroy, OnInit} from '@angular/core';
import {AlertService, ParseLinks, EventManager} from 'ng-jhipster';
import {ResponseWrapper} from '../shared/model/response-wrapper.model';
import {ActivatedRoute, Router} from '@angular/router';
import {Grantservice} from '../shared/grant/grant.service';
import {ITEMS_PER_PAGE} from '../shared/constants/pagination.constants';
import {Principal} from '../shared/auth/principal.service';
import {GrantDTO} from '../shared/grant/grant.model';

@Component({
    selector: 'jhi-grants',
    templateUrl: './grants.component.html',
    styleUrls: [
        'grants.scss'
    ]
})
export class GrantsComponent implements OnInit, OnDestroy {
    routeData: any;
    links: any;
    totalItems: any;
    itemsPerPage: any;
    page: any;
    predicate: any;
    previousPage: any;
    reverse: any;
    currentAccount: any;
    grantDTOs: GrantDTO[];
    filters = [
        {name: 'Vinnova', value: 1},
        {name: 'Tillväxtverket', value: 2},
        {name: 'Almi', value: 3}
    ];
    titles = ['Utlysare', 'Titel', 'Beskrivning', 'Finansiering', 'Ansök senast', 'Status'];

    constructor(private alertService: AlertService,
                private parseLinks: ParseLinks,
                private grantService: Grantservice,
                private principal: Principal,
                private eventManager: EventManager,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        this.itemsPerPage = ITEMS_PER_PAGE;
        this.routeData = this.activatedRoute.data.subscribe((data) => {
            this.page = data['pagingParams'].page;
            this.previousPage = data['pagingParams'].page;
            this.reverse = data['pagingParams'].ascending;
            this.predicate = data['pagingParams'].predicate;
        });
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.loadAll();
        this.registerChangeInGrants();
    }

    ngOnDestroy() {
        this.routeData.unsubscribe();
    }

    registerChangeInGrants() {
        this.eventManager.subscribe('grantListModification', (response) => this.loadAll());
    }

    onFiltering() {
    }

    loadAll() {
        this.grantService.query({
            page: this.page - 1,
            size: this.itemsPerPage,
            sort: this.sort()
        }).subscribe(
            (res: ResponseWrapper) => this.onSuccess(res.json, res.headers),
            (res: ResponseWrapper) => this.onError(res.json)
        );
    }

    sort() {
        const result = [this.predicate + ',' + (this.reverse ? 'asc' : 'desc')];
        if (this.predicate !== 'id') {
            result.push('id');
        }
        return result;
    }

    loadPage(page: number) {
        if (page !== this.previousPage) {
            this.previousPage = page;
            this.transition();
        }
    }

    transition() {
        this.router.navigate(['/grants'], {
            queryParams: {
                page: this.page,
                sort: this.predicate + ',' + (this.reverse ? 'asc' : 'desc')
            }
        });
        this.loadAll();
    }

    private onSuccess(data, headers) {
        this.links = this.parseLinks.parse(headers.get('link'));
        this.totalItems = headers.get('X-Total-Count');
        this.grantDTOs = data;
    }

    private onError(error) {
        this.alertService.error(error.error, error.message, null);
    }
}