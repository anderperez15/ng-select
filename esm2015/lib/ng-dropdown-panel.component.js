/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Inject, Input, NgZone, Optional, Output, Renderer2, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, asapScheduler, fromEvent, merge, Subject } from 'rxjs';
import { auditTime, takeUntil } from 'rxjs/operators';
import { NgDropdownPanelService } from './ng-dropdown-panel.service';
import { isDefined } from './value-utils';
/** @type {?} */
const TOP_CSS_CLASS = 'ng-select-top';
/** @type {?} */
const BOTTOM_CSS_CLASS = 'ng-select-bottom';
/** @type {?} */
const SCROLL_SCHEDULER = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;
export class NgDropdownPanelComponent {
    /**
     * @param {?} _renderer
     * @param {?} _zone
     * @param {?} _panelService
     * @param {?} _elementRef
     * @param {?} _document
     */
    constructor(_renderer, _zone, _panelService, _elementRef, _document) {
        this._renderer = _renderer;
        this._zone = _zone;
        this._panelService = _panelService;
        this._document = _document;
        this.items = [];
        this.position = 'auto';
        this.virtualScroll = false;
        this.filterValue = null;
        this.resizeWidth = 1;
        this.update = new EventEmitter();
        this.scroll = new EventEmitter();
        this.scrollToEnd = new EventEmitter();
        this.outsideClick = new EventEmitter();
        this._destroy$ = new Subject();
        this._scrollToEndFired = false;
        this._updateScrollHeight = false;
        this._lastScrollPosition = 0;
        this._dropdown = _elementRef.nativeElement;
    }
    /**
     * @return {?}
     */
    get currentPosition() {
        return this._currentPosition;
    }
    /**
     * @private
     * @return {?}
     */
    get itemsLength() {
        return this._itemsLength;
    }
    /**
     * @private
     * @param {?} value
     * @return {?}
     */
    set itemsLength(value) {
        if (value !== this._itemsLength) {
            this._itemsLength = value;
            this._onItemsLengthChanged();
        }
    }
    /**
     * @private
     * @return {?}
     */
    get _startOffset() {
        if (this.markedItem) {
            const { itemHeight, panelHeight } = this._panelService.dimensions;
            /** @type {?} */
            const offset = this.markedItem.index * itemHeight;
            return panelHeight > offset ? 0 : offset;
        }
        return 0;
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    handleMousedown($event) {
        /** @type {?} */
        const target = (/** @type {?} */ ($event.target));
        if (target.tagName === 'INPUT') {
            return;
        }
        $event.preventDefault();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._select = this._dropdown.parentElement;
        this._virtualPadding = this.paddingElementRef.nativeElement;
        this._scrollablePanel = this.scrollElementRef.nativeElement;
        this._contentPanel = this.contentElementRef.nativeElement;
        this._handleScroll();
        this._handleOutsideClick();
        this._appendDropdown();
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (changes.items) {
            /** @type {?} */
            const change = changes.items;
            this._onItemsChange(change.currentValue, change.firstChange);
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
        this._destroy$.unsubscribe();
        if (this.appendTo) {
            this._renderer.removeChild(this._dropdown.parentNode, this._dropdown);
        }
    }
    /**
     * @param {?} option
     * @param {?=} startFromOption
     * @return {?}
     */
    scrollTo(option, startFromOption = false) {
        if (!option) {
            return;
        }
        /** @type {?} */
        const index = this.items.indexOf(option);
        if (index < 0 || index >= this.itemsLength) {
            return;
        }
        /** @type {?} */
        let scrollTo;
        if (this.virtualScroll) {
            /** @type {?} */
            const itemHeight = this._panelService.dimensions.itemHeight;
            scrollTo = this._panelService.getScrollTo(index * itemHeight, itemHeight, this._lastScrollPosition);
        }
        else {
            /** @type {?} */
            const item = this._dropdown.querySelector(`#${option.htmlId}`);
            /** @type {?} */
            const lastScroll = startFromOption ? item.offsetTop : this._lastScrollPosition;
            scrollTo = this._panelService.getScrollTo(item.offsetTop, item.clientHeight, lastScroll);
        }
        if (isDefined(scrollTo)) {
            this._scrollablePanel.scrollTop = scrollTo;
        }
    }
    /**
     * @return {?}
     */
    scrollToTag() {
        /** @type {?} */
        const panel = this._scrollablePanel;
        panel.scrollTop = panel.scrollHeight - panel.clientHeight;
    }
    /**
     * @return {?}
     */
    adjustPosition() {
        /** @type {?} */
        const parent = this._parent.getBoundingClientRect();
        /** @type {?} */
        const select = this._select.getBoundingClientRect();
        this._setOffset(parent, select);
    }
    /**
     * @private
     * @return {?}
     */
    _handleDropdownPosition() {
        this._currentPosition = this._calculateCurrentPosition(this._dropdown);
        if (this._currentPosition === 'top') {
            this._renderer.addClass(this._dropdown, TOP_CSS_CLASS);
            this._renderer.removeClass(this._dropdown, BOTTOM_CSS_CLASS);
            this._renderer.addClass(this._select, TOP_CSS_CLASS);
            this._renderer.removeClass(this._select, BOTTOM_CSS_CLASS);
        }
        else {
            this._renderer.addClass(this._dropdown, BOTTOM_CSS_CLASS);
            this._renderer.removeClass(this._dropdown, TOP_CSS_CLASS);
            this._renderer.addClass(this._select, BOTTOM_CSS_CLASS);
            this._renderer.removeClass(this._select, TOP_CSS_CLASS);
        }
        if (this.appendTo) {
            this._updatePosition();
        }
        this._dropdown.style.opacity = '1';
    }
    /**
     * @private
     * @return {?}
     */
    _handleScroll() {
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            fromEvent(this.scrollElementRef.nativeElement, 'scroll')
                .pipe(takeUntil(this._destroy$), auditTime(0, SCROLL_SCHEDULER))
                .subscribe((/**
             * @param {?} e
             * @return {?}
             */
            (e) => this._onContentScrolled(e.target.scrollTop)));
        }));
    }
    /**
     * @private
     * @return {?}
     */
    _handleOutsideClick() {
        if (!this._document) {
            return;
        }
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            merge(fromEvent(this._document, 'touchstart', { capture: true }), fromEvent(this._document, 'mousedown', { capture: true })).pipe(takeUntil(this._destroy$))
                .subscribe((/**
             * @param {?} $event
             * @return {?}
             */
            $event => this._checkToClose($event)));
        }));
    }
    /**
     * @private
     * @param {?} $event
     * @return {?}
     */
    _checkToClose($event) {
        if (this._select.contains($event.target) || this._dropdown.contains($event.target)) {
            return;
        }
        /** @type {?} */
        const path = $event.path || ($event.composedPath && $event.composedPath());
        if ($event.target && $event.target.shadowRoot && path && path[0] && this._select.contains(path[0])) {
            return;
        }
        this._zone.run((/**
         * @return {?}
         */
        () => this.outsideClick.emit()));
    }
    /**
     * @private
     * @param {?} items
     * @param {?} firstChange
     * @return {?}
     */
    _onItemsChange(items, firstChange) {
        this.items = items || [];
        this._scrollToEndFired = false;
        this.itemsLength = items.length;
        if (this.virtualScroll) {
            this._updateItemsRange(firstChange);
        }
        else {
            this._updateItems(firstChange);
        }
    }
    /**
     * @private
     * @param {?} firstChange
     * @return {?}
     */
    _updateItems(firstChange) {
        this.update.emit(this.items);
        if (firstChange === false) {
            return;
        }
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            Promise.resolve().then((/**
             * @return {?}
             */
            () => {
                /** @type {?} */
                const panelHeight = this._scrollablePanel.clientHeight;
                this._panelService.setDimensions(0, panelHeight);
                this._handleDropdownPosition();
                this.scrollTo(this.markedItem, firstChange);
            }));
        }));
    }
    /**
     * @private
     * @param {?} firstChange
     * @return {?}
     */
    _updateItemsRange(firstChange) {
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        () => {
            this._measureDimensions().then((/**
             * @return {?}
             */
            () => {
                if (firstChange) {
                    this._renderItemsRange(this._startOffset);
                    this._handleDropdownPosition();
                }
                else {
                    this._renderItemsRange();
                }
            }));
        }));
    }
    /**
     * @private
     * @param {?} scrollTop
     * @return {?}
     */
    _onContentScrolled(scrollTop) {
        if (this.virtualScroll) {
            this._renderItemsRange(scrollTop);
        }
        this._lastScrollPosition = scrollTop;
        this._fireScrollToEnd(scrollTop);
    }
    /**
     * @private
     * @param {?} height
     * @return {?}
     */
    _updateVirtualHeight(height) {
        if (this._updateScrollHeight) {
            this._virtualPadding.style.height = `${height}px`;
            this._updateScrollHeight = false;
        }
    }
    /**
     * @private
     * @return {?}
     */
    _onItemsLengthChanged() {
        this._updateScrollHeight = true;
    }
    /**
     * @private
     * @param {?=} scrollTop
     * @return {?}
     */
    _renderItemsRange(scrollTop = null) {
        if (scrollTop && this._lastScrollPosition === scrollTop) {
            return;
        }
        scrollTop = scrollTop || this._scrollablePanel.scrollTop;
        /** @type {?} */
        const range = this._panelService.calculateItems(scrollTop, this.itemsLength, this.bufferAmount);
        this._updateVirtualHeight(range.scrollHeight);
        this._contentPanel.style.transform = `translateY(${range.topPadding}px)`;
        this._zone.run((/**
         * @return {?}
         */
        () => {
            this.update.emit(this.items.slice(range.start, range.end));
            this.scroll.emit({ start: range.start, end: range.end });
        }));
        if (isDefined(scrollTop) && this._lastScrollPosition === 0) {
            this._scrollablePanel.scrollTop = scrollTop;
            this._lastScrollPosition = scrollTop;
        }
    }
    /**
     * @private
     * @return {?}
     */
    _measureDimensions() {
        if (this._panelService.dimensions.itemHeight > 0 || this.itemsLength === 0) {
            return Promise.resolve(this._panelService.dimensions);
        }
        const [first] = this.items;
        this.update.emit([first]);
        return Promise.resolve().then((/**
         * @return {?}
         */
        () => {
            /** @type {?} */
            const option = this._dropdown.querySelector(`#${first.htmlId}`);
            /** @type {?} */
            const optionHeight = option.clientHeight;
            this._virtualPadding.style.height = `${optionHeight * this.itemsLength}px`;
            /** @type {?} */
            const panelHeight = this._scrollablePanel.clientHeight;
            this._panelService.setDimensions(optionHeight, panelHeight);
            return this._panelService.dimensions;
        }));
    }
    /**
     * @private
     * @param {?} scrollTop
     * @return {?}
     */
    _fireScrollToEnd(scrollTop) {
        if (this._scrollToEndFired || scrollTop === 0) {
            return;
        }
        /** @type {?} */
        const padding = this.virtualScroll ?
            this._virtualPadding :
            this._contentPanel;
        if (scrollTop + this._dropdown.clientHeight >= padding.clientHeight) {
            this._zone.run((/**
             * @return {?}
             */
            () => this.scrollToEnd.emit()));
            this._scrollToEndFired = true;
        }
    }
    /**
     * @private
     * @param {?} dropdownEl
     * @return {?}
     */
    _calculateCurrentPosition(dropdownEl) {
        if (this.position !== 'auto') {
            return this.position;
        }
        /** @type {?} */
        const selectRect = this._select.getBoundingClientRect();
        /** @type {?} */
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        /** @type {?} */
        const offsetTop = selectRect.top + window.pageYOffset;
        /** @type {?} */
        const height = selectRect.height;
        /** @type {?} */
        const dropdownHeight = dropdownEl.getBoundingClientRect().height;
        if (offsetTop + height + dropdownHeight > scrollTop + document.documentElement.clientHeight) {
            return 'top';
        }
        else {
            return 'bottom';
        }
    }
    /**
     * @private
     * @return {?}
     */
    _appendDropdown() {
        if (!this.appendTo) {
            return;
        }
        this._parent = document.querySelector(this.appendTo);
        if (!parent) {
            throw new Error(`appendTo selector ${this.appendTo} did not found any parent element`);
        }
        this._parent.appendChild(this._dropdown);
    }
    /**
     * @private
     * @return {?}
     */
    _updatePosition() {
        /** @type {?} */
        const select = this._select.getBoundingClientRect();
        /** @type {?} */
        const parent = this._parent.getBoundingClientRect();
        /** @type {?} */
        const offsetLeft = select.left - parent.left;
        this._setOffset(parent, select);
        this._dropdown.style.left = offsetLeft + 'px';
        this._dropdown.style.width = (select.width * this.resizeWidth) + 'px';
        this._dropdown.style.minWidth = (select.width * this.resizeWidth) + 'px';
    }
    /**
     * @private
     * @param {?} parent
     * @param {?} select
     * @return {?}
     */
    _setOffset(parent, select) {
        /** @type {?} */
        const delta = select.height;
        if (this._currentPosition === 'top') {
            /** @type {?} */
            const offsetBottom = parent.bottom - select.bottom;
            this._dropdown.style.bottom = offsetBottom + delta + 'px';
            this._dropdown.style.top = 'auto';
        }
        else if (this._currentPosition === 'bottom') {
            /** @type {?} */
            const offsetTop = select.top - parent.top;
            this._dropdown.style.top = offsetTop + delta + 'px';
            this._dropdown.style.bottom = 'auto';
        }
    }
}
NgDropdownPanelComponent.decorators = [
    { type: Component, args: [{
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                selector: 'ng-dropdown-panel',
                template: `
        <div *ngIf="headerTemplate" class="ng-dropdown-header">
            <ng-container [ngTemplateOutlet]="headerTemplate" [ngTemplateOutletContext]="{ searchTerm: filterValue }"></ng-container>
        </div>
        <div #scroll class="ng-dropdown-panel-items scroll-host">
            <div #padding [class.total-padding]="virtualScroll"></div>
            <div #content [class.scrollable-content]="virtualScroll && items.length">
                <ng-content></ng-content>
            </div>
        </div>
        <ng-content select=".footer"></ng-content>
        <div *ngIf="footerTemplate" class="ng-dropdown-footer">
            <ng-container [ngTemplateOutlet]="footerTemplate" [ngTemplateOutletContext]="{ searchTerm: filterValue }"></ng-container>
        </div>
    `
            }] }
];
/** @nocollapse */
NgDropdownPanelComponent.ctorParameters = () => [
    { type: Renderer2 },
    { type: NgZone },
    { type: NgDropdownPanelService },
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
];
NgDropdownPanelComponent.propDecorators = {
    items: [{ type: Input }],
    markedItem: [{ type: Input }],
    position: [{ type: Input }],
    appendTo: [{ type: Input }],
    bufferAmount: [{ type: Input }],
    virtualScroll: [{ type: Input }],
    headerTemplate: [{ type: Input }],
    footerTemplate: [{ type: Input }],
    filterValue: [{ type: Input }],
    resizeWidth: [{ type: Input }],
    update: [{ type: Output }],
    scroll: [{ type: Output }],
    scrollToEnd: [{ type: Output }],
    outsideClick: [{ type: Output }],
    contentElementRef: [{ type: ViewChild, args: ['content', { read: ElementRef, static: true },] }],
    scrollElementRef: [{ type: ViewChild, args: ['scroll', { read: ElementRef, static: true },] }],
    paddingElementRef: [{ type: ViewChild, args: ['padding', { read: ElementRef, static: true },] }],
    handleMousedown: [{ type: HostListener, args: ['mousedown', ['$event'],] }]
};
if (false) {
    /** @type {?} */
    NgDropdownPanelComponent.prototype.items;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.markedItem;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.position;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.appendTo;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.bufferAmount;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.virtualScroll;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.headerTemplate;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.footerTemplate;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.filterValue;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.resizeWidth;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.update;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.scroll;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.scrollToEnd;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.outsideClick;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.contentElementRef;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.scrollElementRef;
    /** @type {?} */
    NgDropdownPanelComponent.prototype.paddingElementRef;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._destroy$;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._dropdown;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._virtualPadding;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._scrollablePanel;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._contentPanel;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._select;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._parent;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._scrollToEndFired;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._updateScrollHeight;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._lastScrollPosition;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._currentPosition;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._itemsLength;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._renderer;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._zone;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._panelService;
    /**
     * @type {?}
     * @private
     */
    NgDropdownPanelComponent.prototype._document;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZHJvcGRvd24tcGFuZWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLXNlbGVjdC9uZy1zZWxlY3QvIiwic291cmNlcyI6WyJsaWIvbmctZHJvcGRvd24tcGFuZWwuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxFQUNILHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixZQUFZLEVBQ1osTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBSU4sUUFBUSxFQUNSLE1BQU0sRUFDTixTQUFTLEVBRVQsV0FBVyxFQUNYLFNBQVMsRUFDVCxpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6RixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxzQkFBc0IsRUFBbUIsTUFBTSw2QkFBNkIsQ0FBQztBQUl0RixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDOztNQUVwQyxhQUFhLEdBQUcsZUFBZTs7TUFDL0IsZ0JBQWdCLEdBQUcsa0JBQWtCOztNQUNyQyxnQkFBZ0IsR0FBRyxPQUFPLHFCQUFxQixLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLGFBQWE7QUFzQi9HLE1BQU0sT0FBTyx3QkFBd0I7Ozs7Ozs7O0lBaUNqQyxZQUNZLFNBQW9CLEVBQ3BCLEtBQWEsRUFDYixhQUFxQyxFQUM3QyxXQUF1QixFQUNlLFNBQWM7UUFKNUMsY0FBUyxHQUFULFNBQVMsQ0FBVztRQUNwQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2Isa0JBQWEs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QiwyQ0FBNkI7Ozs7O0lBQzdCLHFEQUFrQzs7Ozs7SUFDbEMsdURBQW9DOzs7OztJQUNwQyx1REFBZ0M7Ozs7O0lBWWhDLG9EQUEyQzs7Ozs7SUFNM0MsZ0RBQTZCOzs7OztJQWZ6Qiw2Q0FBNEI7Ozs7O0lBQzVCLHlDQUFxQjs7Ozs7SUFDckIsaURBQTZDOzs7OztJQUU3Qyw2Q0FBb0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICAgIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIENvbXBvbmVudCxcbiAgICBFbGVtZW50UmVmLFxuICAgIEV2ZW50RW1pdHRlcixcbiAgICBIb3N0TGlzdGVuZXIsXG4gICAgSW5qZWN0LFxuICAgIElucHV0LFxuICAgIE5nWm9uZSxcbiAgICBPbkNoYW5nZXMsXG4gICAgT25EZXN0cm95LFxuICAgIE9uSW5pdCxcbiAgICBPcHRpb25hbCxcbiAgICBPdXRwdXQsXG4gICAgUmVuZGVyZXIyLFxuICAgIFNpbXBsZUNoYW5nZXMsXG4gICAgVGVtcGxhdGVSZWYsXG4gICAgVmlld0NoaWxkLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgYW5pbWF0aW9uRnJhbWVTY2hlZHVsZXIsIGFzYXBTY2hlZHVsZXIsIGZyb21FdmVudCwgbWVyZ2UsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGF1ZGl0VGltZSwgdGFrZVVudGlsIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgTmdEcm9wZG93blBhbmVsU2VydmljZSwgUGFuZWxEaW1lbnNpb25zIH0gZnJvbSAnLi9uZy1kcm9wZG93bi1wYW5lbC5zZXJ2aWNlJztcblxuaW1wb3J0IHsgRHJvcGRvd25Qb3NpdGlvbiB9IGZyb20gJy4vbmctc2VsZWN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOZ09wdGlvbiB9IGZyb20gJy4vbmctc2VsZWN0LnR5cGVzJztcbmltcG9ydCB7IGlzRGVmaW5lZCB9IGZyb20gJy4vdmFsdWUtdXRpbHMnO1xuXG5jb25zdCBUT1BfQ1NTX0NMQVNTID0gJ25nLXNlbGVjdC10b3AnO1xuY29uc3QgQk9UVE9NX0NTU19DTEFTUyA9ICduZy1zZWxlY3QtYm90dG9tJztcbmNvbnN0IFNDUk9MTF9TQ0hFRFVMRVIgPSB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAndW5kZWZpbmVkJyA/IGFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyIDogYXNhcFNjaGVkdWxlcjtcblxuQENvbXBvbmVudCh7XG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgICBzZWxlY3RvcjogJ25nLWRyb3Bkb3duLXBhbmVsJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGl2ICpuZ0lmPVwiaGVhZGVyVGVtcGxhdGVcIiBjbGFzcz1cIm5nLWRyb3Bkb3duLWhlYWRlclwiPlxuICAgICAgICAgICAgPG5nLWNvbnRhaW5lciBbbmdUZW1wbGF0ZU91dGxldF09XCJoZWFkZXJUZW1wbGF0ZVwiIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7IHNlYXJjaFRlcm06IGZpbHRlclZhbHVlIH1cIj48L25nLWNvbnRhaW5lcj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgI3Njcm9sbCBjbGFzcz1cIm5nLWRyb3Bkb3duLXBhbmVsLWl0ZW1zIHNjcm9sbC1ob3N0XCI+XG4gICAgICAgICAgICA8ZGl2ICNwYWRkaW5nIFtjbGFzcy50b3RhbC1wYWRkaW5nXT1cInZpcnR1YWxTY3JvbGxcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgI2NvbnRlbnQgW2NsYXNzLnNjcm9sbGFibGUtY29udGVudF09XCJ2aXJ0dWFsU2Nyb2xsICYmIGl0ZW1zLmxlbmd0aFwiPlxuICAgICAgICAgICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiLmZvb3RlclwiPjwvbmctY29udGVudD5cbiAgICAgICAgPGRpdiAqbmdJZj1cImZvb3RlclRlbXBsYXRlXCIgY2xhc3M9XCJuZy1kcm9wZG93bi1mb290ZXJcIj5cbiAgICAgICAgICAgIDxuZy1jb250YWluZXIgW25nVGVtcGxhdGVPdXRsZXRdPVwiZm9vdGVyVGVtcGxhdGVcIiBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwieyBzZWFyY2hUZXJtOiBmaWx0ZXJWYWx1ZSB9XCI+PC9uZy1jb250YWluZXI+XG4gICAgICAgIDwvZGl2PlxuICAgIGBcbn0pXG5leHBvcnQgY2xhc3MgTmdEcm9wZG93blBhbmVsQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG5cbiAgICBASW5wdXQoKSBpdGVtczogTmdPcHRpb25bXSA9IFtdO1xuICAgIEBJbnB1dCgpIG1hcmtlZEl0ZW06IE5nT3B0aW9uO1xuICAgIEBJbnB1dCgpIHBvc2l0aW9uOiBEcm9wZG93blBvc2l0aW9uID0gJ2F1dG8nO1xuICAgIEBJbnB1dCgpIGFwcGVuZFRvOiBzdHJpbmc7XG4gICAgQElucHV0KCkgYnVmZmVyQW1vdW50O1xuICAgIEBJbnB1dCgpIHZpcnR1YWxTY3JvbGwgPSBmYWxzZTtcbiAgICBASW5wdXQoKSBoZWFkZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcbiAgICBASW5wdXQoKSBmb290ZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcbiAgICBASW5wdXQoKSBmaWx0ZXJWYWx1ZTogc3RyaW5nID0gbnVsbDtcbiAgICBASW5wdXQoKSByZXNpemVXaWR0aDogbnVtYmVyID0gMTtcblxuICAgIEBPdXRwdXQoKSB1cGRhdGUgPSBuZXcgRXZlbnRFbWl0dGVyPGFueVtdPigpO1xuICAgIEBPdXRwdXQoKSBzY3JvbGwgPSBuZXcgRXZlbnRFbWl0dGVyPHsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXIgfT4oKTtcbiAgICBAT3V0cHV0KCkgc2Nyb2xsVG9FbmQgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG4gICAgQE91dHB1dCgpIG91dHNpZGVDbGljayA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcblxuICAgIEBWaWV3Q2hpbGQoJ2NvbnRlbnQnLCB7IHJlYWQ6IEVsZW1lbnRSZWYsIHN0YXRpYzogdHJ1ZSB9KSBjb250ZW50RWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdzY3JvbGwnLCB7IHJlYWQ6IEVsZW1lbnRSZWYsIHN0YXRpYzogdHJ1ZSB9KSBzY3JvbGxFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ3BhZGRpbmcnLCB7IHJlYWQ6IEVsZW1lbnRSZWYsIHN0YXRpYzogdHJ1ZSB9KSBwYWRkaW5nRWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Rlc3Ryb3kkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9kcm9wZG93bjogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfdmlydHVhbFBhZGRpbmc6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX3Njcm9sbGFibGVQYW5lbDogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfY29udGVudFBhbmVsOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF9zZWxlY3Q6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX3BhcmVudDogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfc2Nyb2xsVG9FbmRGaXJlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX3VwZGF0ZVNjcm9sbEhlaWdodCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2xhc3RTY3JvbGxQb3NpdGlvbiA9IDA7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICAgICAgcHJpdmF0ZSBfem9uZTogTmdab25lLFxuICAgICAgICBwcml2YXRlIF9wYW5lbFNlcnZpY2U6IE5nRHJvcGRvd25QYW5lbFNlcnZpY2UsXG4gICAgICAgIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2N1bWVudDogYW55XG4gICAgKSB7XG4gICAgICAgIHRoaXMuX2Ryb3Bkb3duID0gX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jdXJyZW50UG9zaXRpb246IERyb3Bkb3duUG9zaXRpb247XG5cbiAgICBnZXQgY3VycmVudFBvc2l0aW9uKCk6IERyb3Bkb3duUG9zaXRpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2l0ZW1zTGVuZ3RoOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIGdldCBpdGVtc0xlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2l0ZW1zTGVuZ3RoO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0IGl0ZW1zTGVuZ3RoKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLl9pdGVtc0xlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5faXRlbXNMZW5ndGggPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuX29uSXRlbXNMZW5ndGhDaGFuZ2VkKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBfc3RhcnRPZmZzZXQoKSB7XG4gICAgICAgIGlmICh0aGlzLm1hcmtlZEl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnN0IHsgaXRlbUhlaWdodCwgcGFuZWxIZWlnaHQgfSA9IHRoaXMuX3BhbmVsU2VydmljZS5kaW1lbnNpb25zO1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdGhpcy5tYXJrZWRJdGVtLmluZGV4ICogaXRlbUhlaWdodDtcbiAgICAgICAgICAgIHJldHVybiBwYW5lbEhlaWdodCA+IG9mZnNldCA/IDAgOiBvZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcignbW91c2Vkb3duJywgWyckZXZlbnQnXSlcbiAgICBoYW5kbGVNb3VzZWRvd24oJGV2ZW50OiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9ICRldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmICh0YXJnZXQudGFnTmFtZSA9PT0gJ0lOUFVUJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLl9zZWxlY3QgPSB0aGlzLl9kcm9wZG93bi5wYXJlbnRFbGVtZW50O1xuICAgICAgICB0aGlzLl92aXJ0dWFsUGFkZGluZyA9IHRoaXMucGFkZGluZ0VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5fc2Nyb2xsYWJsZVBhbmVsID0gdGhpcy5zY3JvbGxFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2NvbnRlbnRQYW5lbCA9IHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5faGFuZGxlU2Nyb2xsKCk7XG4gICAgICAgIHRoaXMuX2hhbmRsZU91dHNpZGVDbGljaygpO1xuICAgICAgICB0aGlzLl9hcHBlbmREcm9wZG93bigpO1xuICAgIH1cblxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9IGNoYW5nZXMuaXRlbXM7XG4gICAgICAgICAgICB0aGlzLl9vbkl0ZW1zQ2hhbmdlKGNoYW5nZS5jdXJyZW50VmFsdWUsIGNoYW5nZS5maXJzdENoYW5nZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5fZGVzdHJveSQubmV4dCgpO1xuICAgICAgICB0aGlzLl9kZXN0cm95JC5jb21wbGV0ZSgpO1xuICAgICAgICB0aGlzLl9kZXN0cm95JC51bnN1YnNjcmliZSgpO1xuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbykge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2hpbGQodGhpcy5fZHJvcGRvd24ucGFyZW50Tm9kZSwgdGhpcy5fZHJvcGRvd24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2Nyb2xsVG8ob3B0aW9uOiBOZ09wdGlvbiwgc3RhcnRGcm9tT3B0aW9uID0gZmFsc2UpIHtcbiAgICAgICAgaWYgKCFvcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pdGVtcy5pbmRleE9mKG9wdGlvbik7XG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5pdGVtc0xlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNjcm9sbFRvO1xuICAgICAgICBpZiAodGhpcy52aXJ0dWFsU2Nyb2xsKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtSGVpZ2h0ID0gdGhpcy5fcGFuZWxTZXJ2aWNlLmRpbWVuc2lvbnMuaXRlbUhlaWdodDtcbiAgICAgICAgICAgIHNjcm9sbFRvID0gdGhpcy5fcGFuZWxTZXJ2aWNlLmdldFNjcm9sbFRvKGluZGV4ICogaXRlbUhlaWdodCwgaXRlbUhlaWdodCwgdGhpcy5fbGFzdFNjcm9sbFBvc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW06IEhUTUxFbGVtZW50ID0gdGhpcy5fZHJvcGRvd24ucXVlcnlTZWxlY3RvcihgIyR7b3B0aW9uLmh0bWxJZH1gKTtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTY3JvbGwgPSBzdGFydEZyb21PcHRpb24gPyBpdGVtLm9mZnNldFRvcCA6IHRoaXMuX2xhc3RTY3JvbGxQb3NpdGlvbjtcbiAgICAgICAgICAgIHNjcm9sbFRvID0gdGhpcy5fcGFuZWxTZXJ2aWNlLmdldFNjcm9sbFRvKGl0ZW0ub2Zmc2V0VG9wLCBpdGVtLmNsaWVudEhlaWdodCwgbGFzdFNjcm9sbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNEZWZpbmVkKHNjcm9sbFRvKSkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsYWJsZVBhbmVsLnNjcm9sbFRvcCA9IHNjcm9sbFRvO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2Nyb2xsVG9UYWcoKSB7XG4gICAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5fc2Nyb2xsYWJsZVBhbmVsO1xuICAgICAgICBwYW5lbC5zY3JvbGxUb3AgPSBwYW5lbC5zY3JvbGxIZWlnaHQgLSBwYW5lbC5jbGllbnRIZWlnaHQ7XG4gICAgfVxuXG4gICAgYWRqdXN0UG9zaXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX3BhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ID0gdGhpcy5fc2VsZWN0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLl9zZXRPZmZzZXQocGFyZW50LCBzZWxlY3QpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2hhbmRsZURyb3Bkb3duUG9zaXRpb24oKSB7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9IHRoaXMuX2NhbGN1bGF0ZUN1cnJlbnRQb3NpdGlvbih0aGlzLl9kcm9wZG93bik7XG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50UG9zaXRpb24gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9kcm9wZG93biwgVE9QX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9kcm9wZG93biwgQk9UVE9NX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9zZWxlY3QsIFRPUF9DU1NfQ0xBU1MpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5fc2VsZWN0LCBCT1RUT01fQ1NTX0NMQVNTKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5fZHJvcGRvd24sIEJPVFRPTV9DU1NfQ0xBU1MpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5fZHJvcGRvd24sIFRPUF9DU1NfQ0xBU1MpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5fc2VsZWN0LCBCT1RUT01fQ1NTX0NMQVNTKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX3NlbGVjdCwgVE9QX0NTU19DTEFTUyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbykge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlU2Nyb2xsKCkge1xuICAgICAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIGZyb21FdmVudCh0aGlzLnNjcm9sbEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ3Njcm9sbCcpXG4gICAgICAgICAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kkKSwgYXVkaXRUaW1lKDAsIFNDUk9MTF9TQ0hFRFVMRVIpKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKGU6IHsgdGFyZ2V0OiBIVE1MRWxlbWVudCB9KSA9PiB0aGlzLl9vbkNvbnRlbnRTY3JvbGxlZChlLnRhcmdldC5zY3JvbGxUb3ApKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlT3V0c2lkZUNsaWNrKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2RvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIG1lcmdlKFxuICAgICAgICAgICAgICAgIGZyb21FdmVudCh0aGlzLl9kb2N1bWVudCwgJ3RvdWNoc3RhcnQnLCB7IGNhcHR1cmU6IHRydWUgfSksXG4gICAgICAgICAgICAgICAgZnJvbUV2ZW50KHRoaXMuX2RvY3VtZW50LCAnbW91c2Vkb3duJywgeyBjYXB0dXJlOiB0cnVlIH0pXG4gICAgICAgICAgICApLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kkKSlcbiAgICAgICAgICAgICAuc3Vic2NyaWJlKCRldmVudCA9PiB0aGlzLl9jaGVja1RvQ2xvc2UoJGV2ZW50KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2NoZWNrVG9DbG9zZSgkZXZlbnQ6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0LmNvbnRhaW5zKCRldmVudC50YXJnZXQpIHx8IHRoaXMuX2Ryb3Bkb3duLmNvbnRhaW5zKCRldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXRoID0gJGV2ZW50LnBhdGggfHwgKCRldmVudC5jb21wb3NlZFBhdGggJiYgJGV2ZW50LmNvbXBvc2VkUGF0aCgpKTtcbiAgICAgICAgaWYgKCRldmVudC50YXJnZXQgJiYgJGV2ZW50LnRhcmdldC5zaGFkb3dSb290ICYmIHBhdGggJiYgcGF0aFswXSAmJiB0aGlzLl9zZWxlY3QuY29udGFpbnMocGF0aFswXSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3pvbmUucnVuKCgpID0+IHRoaXMub3V0c2lkZUNsaWNrLmVtaXQoKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfb25JdGVtc0NoYW5nZShpdGVtczogTmdPcHRpb25bXSwgZmlyc3RDaGFuZ2U6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5pdGVtcyA9IGl0ZW1zIHx8IFtdO1xuICAgICAgICB0aGlzLl9zY3JvbGxUb0VuZEZpcmVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXRlbXNMZW5ndGggPSBpdGVtcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHRoaXMudmlydHVhbFNjcm9sbCkge1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlSXRlbXNSYW5nZShmaXJzdENoYW5nZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVJdGVtcyhmaXJzdENoYW5nZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVJdGVtcyhmaXJzdENoYW5nZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLnVwZGF0ZS5lbWl0KHRoaXMuaXRlbXMpO1xuICAgICAgICBpZiAoZmlyc3RDaGFuZ2UgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhbmVsSGVpZ2h0ID0gdGhpcy5fc2Nyb2xsYWJsZVBhbmVsLmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYW5lbFNlcnZpY2Uuc2V0RGltZW5zaW9ucygwLCBwYW5lbEhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlRHJvcGRvd25Qb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG8odGhpcy5tYXJrZWRJdGVtLCBmaXJzdENoYW5nZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlSXRlbXNSYW5nZShmaXJzdENoYW5nZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX21lYXN1cmVEaW1lbnNpb25zKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlbmRlckl0ZW1zUmFuZ2UodGhpcy5fc3RhcnRPZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVEcm9wZG93blBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVySXRlbXNSYW5nZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vbkNvbnRlbnRTY3JvbGxlZChzY3JvbGxUb3A6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy52aXJ0dWFsU2Nyb2xsKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJJdGVtc1JhbmdlKHNjcm9sbFRvcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGFzdFNjcm9sbFBvc2l0aW9uID0gc2Nyb2xsVG9wO1xuICAgICAgICB0aGlzLl9maXJlU2Nyb2xsVG9FbmQoc2Nyb2xsVG9wKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVWaXJ0dWFsSGVpZ2h0KGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLl91cGRhdGVTY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxQYWRkaW5nLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVTY3JvbGxIZWlnaHQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX29uSXRlbXNMZW5ndGhDaGFuZ2VkKCkge1xuICAgICAgICB0aGlzLl91cGRhdGVTY3JvbGxIZWlnaHQgPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlbmRlckl0ZW1zUmFuZ2Uoc2Nyb2xsVG9wID0gbnVsbCkge1xuICAgICAgICBpZiAoc2Nyb2xsVG9wICYmIHRoaXMuX2xhc3RTY3JvbGxQb3NpdGlvbiA9PT0gc2Nyb2xsVG9wKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzY3JvbGxUb3AgPSBzY3JvbGxUb3AgfHwgdGhpcy5fc2Nyb2xsYWJsZVBhbmVsLnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLl9wYW5lbFNlcnZpY2UuY2FsY3VsYXRlSXRlbXMoc2Nyb2xsVG9wLCB0aGlzLml0ZW1zTGVuZ3RoLCB0aGlzLmJ1ZmZlckFtb3VudCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVZpcnR1YWxIZWlnaHQocmFuZ2Uuc2Nyb2xsSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fY29udGVudFBhbmVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGVZKCR7cmFuZ2UudG9wUGFkZGluZ31weClgO1xuXG4gICAgICAgIHRoaXMuX3pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlLmVtaXQodGhpcy5pdGVtcy5zbGljZShyYW5nZS5zdGFydCwgcmFuZ2UuZW5kKSk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbC5lbWl0KHsgc3RhcnQ6IHJhbmdlLnN0YXJ0LCBlbmQ6IHJhbmdlLmVuZCB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGlzRGVmaW5lZChzY3JvbGxUb3ApICYmIHRoaXMuX2xhc3RTY3JvbGxQb3NpdGlvbiA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsYWJsZVBhbmVsLnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RTY3JvbGxQb3NpdGlvbiA9IHNjcm9sbFRvcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX21lYXN1cmVEaW1lbnNpb25zKCk6IFByb21pc2U8UGFuZWxEaW1lbnNpb25zPiB7XG4gICAgICAgIGlmICh0aGlzLl9wYW5lbFNlcnZpY2UuZGltZW5zaW9ucy5pdGVtSGVpZ2h0ID4gMCB8fCB0aGlzLml0ZW1zTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3BhbmVsU2VydmljZS5kaW1lbnNpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFtmaXJzdF0gPSB0aGlzLml0ZW1zO1xuICAgICAgICB0aGlzLnVwZGF0ZS5lbWl0KFtmaXJzdF0pO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuX2Ryb3Bkb3duLnF1ZXJ5U2VsZWN0b3IoYCMke2ZpcnN0Lmh0bWxJZH1gKTtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbkhlaWdodCA9IG9wdGlvbi5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUGFkZGluZy5zdHlsZS5oZWlnaHQgPSBgJHtvcHRpb25IZWlnaHQgKiB0aGlzLml0ZW1zTGVuZ3RofXB4YDtcbiAgICAgICAgICAgIGNvbnN0IHBhbmVsSGVpZ2h0ID0gdGhpcy5fc2Nyb2xsYWJsZVBhbmVsLmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX3BhbmVsU2VydmljZS5zZXREaW1lbnNpb25zKG9wdGlvbkhlaWdodCwgcGFuZWxIZWlnaHQpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFuZWxTZXJ2aWNlLmRpbWVuc2lvbnM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2ZpcmVTY3JvbGxUb0VuZChzY3JvbGxUb3A6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsVG9FbmRGaXJlZCB8fCBzY3JvbGxUb3AgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhZGRpbmcgPSB0aGlzLnZpcnR1YWxTY3JvbGwgP1xuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFBhZGRpbmcgOlxuICAgICAgICAgICAgdGhpcy5fY29udGVudFBhbmVsO1xuXG4gICAgICAgIGlmIChzY3JvbGxUb3AgKyB0aGlzLl9kcm9wZG93bi5jbGllbnRIZWlnaHQgPj0gcGFkZGluZy5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuX3pvbmUucnVuKCgpID0+IHRoaXMuc2Nyb2xsVG9FbmQuZW1pdCgpKTtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbFRvRW5kRmlyZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2FsY3VsYXRlQ3VycmVudFBvc2l0aW9uKGRyb3Bkb3duRWw6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnBvc2l0aW9uICE9PSAnYXV0bycpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdFJlY3Q6IENsaWVudFJlY3QgPSB0aGlzLl9zZWxlY3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG4gICAgICAgIGNvbnN0IG9mZnNldFRvcCA9IHNlbGVjdFJlY3QudG9wICsgd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgICAgICBjb25zdCBoZWlnaHQgPSBzZWxlY3RSZWN0LmhlaWdodDtcbiAgICAgICAgY29uc3QgZHJvcGRvd25IZWlnaHQgPSBkcm9wZG93bkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgaWYgKG9mZnNldFRvcCArIGhlaWdodCArIGRyb3Bkb3duSGVpZ2h0ID4gc2Nyb2xsVG9wICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuICd0b3AnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICdib3R0b20nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYXBwZW5kRHJvcGRvd24oKSB7XG4gICAgICAgIGlmICghdGhpcy5hcHBlbmRUbykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcGFyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmFwcGVuZFRvKTtcbiAgICAgICAgaWYgKCFwYXJlbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgYXBwZW5kVG8gc2VsZWN0b3IgJHt0aGlzLmFwcGVuZFRvfSBkaWQgbm90IGZvdW5kIGFueSBwYXJlbnQgZWxlbWVudGApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BhcmVudC5hcHBlbmRDaGlsZCh0aGlzLl9kcm9wZG93bik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlUG9zaXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdCA9IHRoaXMuX3NlbGVjdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBvZmZzZXRMZWZ0ID0gc2VsZWN0LmxlZnQgLSBwYXJlbnQubGVmdDtcblxuICAgICAgICB0aGlzLl9zZXRPZmZzZXQocGFyZW50LCBzZWxlY3QpO1xuXG4gICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLmxlZnQgPSBvZmZzZXRMZWZ0ICsgJ3B4JztcbiAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUud2lkdGggPSAoc2VsZWN0LndpZHRoICogdGhpcy5yZXNpemVXaWR0aCkgKyAncHgnO1xuICAgICAgICB0aGlzLl9kcm9wZG93bi5zdHlsZS5taW5XaWR0aCA9IChzZWxlY3Qud2lkdGggKnRoaXMucmVzaXplV2lkdGgpICsgJ3B4JztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRPZmZzZXQocGFyZW50OiBDbGllbnRSZWN0LCBzZWxlY3Q6IENsaWVudFJlY3QpIHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBzZWxlY3QuaGVpZ2h0O1xuXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50UG9zaXRpb24gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXRCb3R0b20gPSBwYXJlbnQuYm90dG9tIC0gc2VsZWN0LmJvdHRvbTtcbiAgICAgICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLmJvdHRvbSA9IG9mZnNldEJvdHRvbSArIGRlbHRhICsgJ3B4JztcbiAgICAgICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLnRvcCA9ICdhdXRvJztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9jdXJyZW50UG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXRUb3AgPSBzZWxlY3QudG9wIC0gcGFyZW50LnRvcDtcbiAgICAgICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLnRvcCA9IG9mZnNldFRvcCArIGRlbHRhICsgJ3B4JztcbiAgICAgICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLmJvdHRvbSA9ICdhdXRvJztcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==