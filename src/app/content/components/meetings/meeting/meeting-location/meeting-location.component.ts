import { Component, Inject, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { MapsAPILoader } from '@agm/core';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete/ngx-google-places-autocomplete.directive';

// Models
import { MeetingStatuses } from '../../../../../core/models/enums/meeting-statuses';

// Services
import { UserService } from '../../../../../core/services/security/users.service';
import { TranslationService } from '../../../../../core/services/translation.service';

@Component({
    selector: 'm-meeting-location',
    templateUrl: './meeting-location.component.html'
})
export class MeetingLocationComponent implements OnInit {

    closeResult: string;
    isArabic: boolean;
    meetingStatuses = MeetingStatuses;
    zoom: number = 16;
    map: any;
    modalReference: NgbModalRef;
    @Output() meetingLocationEmiter = new EventEmitter();
    @Input() location_lat: number;
    @Input() location_lng: number;
    @Input() canEdit: boolean;
    @ViewChild('places') places: GooglePlaceDirective;
    constructor(private modalService: NgbModal, private _userService: UserService,
        private _translationService: TranslationService,
        public mapsApiLoader: MapsAPILoader) { }

    ngOnInit() {
    }

    open(content) {
        this.getLanguage();
        this.modalReference = this.modalService.open(content, { size: 'xl' as 'lg' });
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    getLanguage() {
        this.isArabic = this._translationService.isArabic();
    }

    mapReady(map) {
        this.map = map;
    }

    markerDragEnd(m: any, $event: any) {
        this.location_lat = m.coords.lat;
        this.location_lng = m.coords.lng;
    }
    handleAddressChange(event) {
       /*  console.log(event); */
        this.location_lat = event.geometry.location.lat();
        this.location_lng = event.geometry.location.lng();

    }

    save(locationForm: NgForm) {
        if (locationForm.valid) { // submit form if valid
            this.getGeoLocation(this.location_lat, this.location_lng);

        }
    }

    getGeoLocation(lat: number, lng: number) {
        if (navigator.geolocation) {
            const geocoder = new google.maps.Geocoder();
            const latlng = new google.maps.LatLng(lat, lng);
            const request: any = { latLng: latlng };
            geocoder.geocode(request, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK) {
                    const result = results[0];
                    if (result != null) {
                        // console.log(result);
                        let meetingVenueAr;
                        let meetingVenueEn;
                        if (this.isArabic) {
                            meetingVenueAr = result.formatted_address;
                            meetingVenueEn = null;
                        } else {
                            meetingVenueAr = null;
                            meetingVenueEn = result.formatted_address;
                        }
                        this.meetingLocationEmiter.emit({
                            location_lat: this.location_lat, location_long: this.location_lng,
                            meeting_venue_ar: meetingVenueAr, meeting_venue_en: meetingVenueEn
                        });

                    } else {
                        console.log('No address available!');
                    }
                    this.modalReference.close();
                }
            });
        }
    }

}
