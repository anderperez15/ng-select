/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Inject, Input, NgZone, Optional, Output, Renderer2, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, asapScheduler, fromEvent, merge, Subject } from 'rxjs';
import { auditTime, takeUntil } from 'rxjs/operators';
import { NgDropdownPanelService } from './ng-dropdown-panel.service';
import { isDefined } from './value-utils';
/** @type {?} */
var TOP_CSS_CLASS = 'ng-select-top';
/** @type {?} */
var BOTTOM_CSS_CLASS = 'ng-select-bottom';
/** @type {?} */
var SCROLL_SCHEDULER = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;
var NgDropdownPanelComponent = /** @class */ (function () {
    function NgDropdownPanelComponent(_renderer, _zone, _panelService, _elementRef, _document) {
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
    Object.defineProperty(NgDropdownPanelComponent.prototype, "currentPosition", {
        get: /**
         * @return {?}
         */
        function () {
            return this._currentPosition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgDropdownPanelComponent.prototype, "itemsLength", {
        get: /**
         * @private
         * @return {?}
         */
        function () {
            return this._itemsLength;
        },
        set: /**
         * @private
         * @param {?} value
         * @return {?}
         */
        function (value) {
            if (value !== this._itemsLength) {
                this._itemsLength = value;
                this._onItemsLengthChanged();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgDropdownPanelComponent.prototype, "_startOffset", {
        get: /**
         * @private
         * @return {?}
         */
        function () {
            if (this.markedItem) {
                var _a = this._panelService.dimensions, itemHeight = _a.itemHeight, panelHeight = _a.panelHeight;
                /** @type {?} */
                var offset = this.markedItem.index * itemHeight;
                return panelHeight > offset ? 0 : offset;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} $event
     * @return {?}
     */
    NgDropdownPanelComponent.prototype.handleMousedown = /**
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
        /** @type {?} */
        var target = (/** @type {?} */ ($event.target));
        if (target.tagName === 'INPUT') {
            return;
        }
        $event.preventDefault();
    };
    /**
     * @return {?}
     */
    NgDropdownPanelComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        this._select = this._dropdown.parentElement;
        this._virtualPadding = this.paddingElementRef.nativeElement;
        this._scrollablePanel = this.scrollElementRef.nativeElement;
        this._contentPanel = this.contentElementRef.nativeElement;
        this._handleScroll();
        this._handleOutsideClick();
        this._appendDropdown();
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    NgDropdownPanelComponent.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        if (changes.items) {
            /** @type {?} */
            var change = changes.items;
            this._onItemsChange(change.currentValue, change.firstChange);
        }
    };
    /**
     * @return {?}
     */
    NgDropdownPanelComponent.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        this._destroy$.next();
        this._destroy$.complete();
        this._destroy$.unsubscribe();
        if (this.appendTo) {
            this._renderer.removeChild(this._dropdown.parentNode, this._dropdown);
        }
    };
    /**
     * @param {?} option
     * @param {?=} startFromOption
     * @return {?}
     */
    NgDropdownPanelComponent.prototype.scrollTo = /**
     * @param {?} option
     * @param {?=} startFromOption
     * @return {?}
     */
    function (option, startFromOption) {
        if (startFromOption === void 0) { startFromOption = false; }
        if (!option) {
            return;
        }
        /** @type {?} */
        var index = this.items.indexOf(option);
        if (index < 0 || index >= this.itemsLength) {
            return;
        }
        /** @type {?} */
        var scrollTo;
        if (this.virtualScroll) {
            /** @type {?} */
            var itemHeight = this._panelService.dimensions.itemHeight;
            scrollTo = this._panelService.getScrollTo(index * itemHeight, itemHeight, this._lastScrollPosition);
        }
        else {
            /** @type {?} */
            var item = this._dropdown.querySelector("#" + option.htmlId);
            /** @type {?} */
            var lastScroll = startFromOption ? item.offsetTop : this._lastScrollPosition;
            scrollTo = this._panelService.getScrollTo(item.offsetTop, item.clientHeight, lastScroll);
        }
        if (isDefined(scrollTo)) {
            this._scrollablePanel.scrollTop = scrollTo;
        }
    };
    /**
     * @return {?}
     */
    NgDropdownPanelComponent.prototype.scrollToTag = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var panel = this._scrollablePanel;
        panel.scrollTop = panel.scrollHeight - panel.clientHeight;
    };
    /**
     * @return {?}
     */
    NgDropdownPanelComponent.prototype.adjustPosition = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var parent = this._parent.getBoundingClientRect();
        /** @type {?} */
        var select = this._select.getBoundingClientRect();
        this._setOffset(parent, select);
    };
    /**
     * @private
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._handleDropdownPosition = /**
     * @private
     * @return {?}
     */
    function () {
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
    };
    /**
     * @private
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._handleScroll = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        function () {
            fromEvent(_this.scrollElementRef.nativeElement, 'scroll')
                .pipe(takeUntil(_this._destroy$), auditTime(0, SCROLL_SCHEDULER))
                .subscribe((/**
             * @param {?} e
             * @return {?}
             */
            function (e) { return _this._onContentScrolled(e.target.scrollTop); }));
        }));
    };
    /**
     * @private
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._handleOutsideClick = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this._document) {
            return;
        }
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        function () {
            merge(fromEvent(_this._document, 'touchstart', { capture: true }), fromEvent(_this._document, 'mousedown', { capture: true })).pipe(takeUntil(_this._destroy$))
                .subscribe((/**
             * @param {?} $event
             * @return {?}
             */
            function ($event) { return _this._checkToClose($event); }));
        }));
    };
    /**
     * @private
     * @param {?} $event
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._checkToClose = /**
     * @private
     * @param {?} $event
     * @return {?}
     */
    function ($event) {
        var _this = this;
        if (this._select.contains($event.target) || this._dropdown.contains($event.target)) {
            return;
        }
        /** @type {?} */
        var path = $event.path || ($event.composedPath && $event.composedPath());
        if ($event.target && $event.target.shadowRoot && path && path[0] && this._select.contains(path[0])) {
            return;
        }
        this._zone.run((/**
         * @return {?}
         */
        function () { return _this.outsideClick.emit(); }));
    };
    /**
     * @private
     * @param {?} items
     * @param {?} firstChange
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._onItemsChange = /**
     * @private
     * @param {?} items
     * @param {?} firstChange
     * @return {?}
     */
    function (items, firstChange) {
        this.items = items || [];
        this._scrollToEndFired = false;
        this.itemsLength = items.length;
        if (this.virtualScroll) {
            this._updateItemsRange(firstChange);
        }
        else {
            this._updateItems(firstChange);
        }
    };
    /**
     * @private
     * @param {?} firstChange
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._updateItems = /**
     * @private
     * @param {?} firstChange
     * @return {?}
     */
    function (firstChange) {
        var _this = this;
        this.update.emit(this.items);
        if (firstChange === false) {
            return;
        }
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        function () {
            Promise.resolve().then((/**
             * @return {?}
             */
            function () {
                /** @type {?} */
                var panelHeight = _this._scrollablePanel.clientHeight;
                _this._panelService.setDimensions(0, panelHeight);
                _this._handleDropdownPosition();
                _this.scrollTo(_this.markedItem, firstChange);
            }));
        }));
    };
    /**
     * @private
     * @param {?} firstChange
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._updateItemsRange = /**
     * @private
     * @param {?} firstChange
     * @return {?}
     */
    function (firstChange) {
        var _this = this;
        this._zone.runOutsideAngular((/**
         * @return {?}
         */
        function () {
            _this._measureDimensions().then((/**
             * @return {?}
             */
            function () {
                if (firstChange) {
                    _this._renderItemsRange(_this._startOffset);
                    _this._handleDropdownPosition();
                }
                else {
                    _this._renderItemsRange();
                }
            }));
        }));
    };
    /**
     * @private
     * @param {?} scrollTop
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._onContentScrolled = /**
     * @private
     * @param {?} scrollTop
     * @return {?}
     */
    function (scrollTop) {
        if (this.virtualScroll) {
            this._renderItemsRange(scrollTop);
        }
        this._lastScrollPosition = scrollTop;
        this._fireScrollToEnd(scrollTop);
    };
    /**
     * @private
     * @param {?} height
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._updateVirtualHeight = /**
     * @private
     * @param {?} height
     * @return {?}
     */
    function (height) {
        if (this._updateScrollHeight) {
            this._virtualPadding.style.height = height + "px";
            this._updateScrollHeight = false;
        }
    };
    /**
     * @private
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._onItemsLengthChanged = /**
     * @private
     * @return {?}
     */
    function () {
        this._updateScrollHeight = true;
    };
    /**
     * @private
     * @param {?=} scrollTop
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._renderItemsRange = /**
     * @private
     * @param {?=} scrollTop
     * @return {?}
     */
    function (scrollTop) {
        var _this = this;
        if (scrollTop === void 0) { scrollTop = null; }
        if (scrollTop && this._lastScrollPosition === scrollTop) {
            return;
        }
        scrollTop = scrollTop || this._scrollablePanel.scrollTop;
        /** @type {?} */
        var range = this._panelService.calculateItems(scrollTop, this.itemsLength, this.bufferAmount);
        this._updateVirtualHeight(range.scrollHeight);
        this._contentPanel.style.transform = "translateY(" + range.topPadding + "px)";
        this._zone.run((/**
         * @return {?}
         */
        function () {
            _this.update.emit(_this.items.slice(range.start, range.end));
            _this.scroll.emit({ start: range.start, end: range.end });
        }));
        if (isDefined(scrollTop) && this._lastScrollPosition === 0) {
            this._scrollablePanel.scrollTop = scrollTop;
            this._lastScrollPosition = scrollTop;
        }
    };
    /**
     * @private
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._measureDimensions = /**
     * @private
     * @return {?}
     */
    function () {
        var _this = this;
        if (this._panelService.dimensions.itemHeight > 0 || this.itemsLength === 0) {
            return Promise.resolve(this._panelService.dimensions);
        }
        var _a = tslib_1.__read(this.items, 1), first = _a[0];
        this.update.emit([first]);
        return Promise.resolve().then((/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var option = _this._dropdown.querySelector("#" + first.htmlId);
            /** @type {?} */
            var optionHeight = option.clientHeight;
            _this._virtualPadding.style.height = optionHeight * _this.itemsLength + "px";
            /** @type {?} */
            var panelHeight = _this._scrollablePanel.clientHeight;
            _this._panelService.setDimensions(optionHeight, panelHeight);
            return _this._panelService.dimensions;
        }));
    };
    /**
     * @private
     * @param {?} scrollTop
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._fireScrollToEnd = /**
     * @private
     * @param {?} scrollTop
     * @return {?}
     */
    function (scrollTop) {
        var _this = this;
        if (this._scrollToEndFired || scrollTop === 0) {
            return;
        }
        /** @type {?} */
        var padding = this.virtualScroll ?
            this._virtualPadding :
            this._contentPanel;
        if (scrollTop + this._dropdown.clientHeight >= padding.clientHeight) {
            this._zone.run((/**
             * @return {?}
             */
            function () { return _this.scrollToEnd.emit(); }));
            this._scrollToEndFired = true;
        }
    };
    /**
     * @private
     * @param {?} dropdownEl
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._calculateCurrentPosition = /**
     * @private
     * @param {?} dropdownEl
     * @return {?}
     */
    function (dropdownEl) {
        if (this.position !== 'auto') {
            return this.position;
        }
        /** @type {?} */
        var selectRect = this._select.getBoundingClientRect();
        /** @type {?} */
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        /** @type {?} */
        var offsetTop = selectRect.top + window.pageYOffset;
        /** @type {?} */
        var height = selectRect.height;
        /** @type {?} */
        var dropdownHeight = dropdownEl.getBoundingClientRect().height;
        if (offsetTop + height + dropdownHeight > scrollTop + document.documentElement.clientHeight) {
            return 'top';
        }
        else {
            return 'bottom';
        }
    };
    /**
     * @private
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._appendDropdown = /**
     * @private
     * @return {?}
     */
    function () {
        if (!this.appendTo) {
            return;
        }
        this._parent = document.querySelector(this.appendTo);
        if (!parent) {
            throw new Error("appendTo selector " + this.appendTo + " did not found any parent element");
        }
        this._parent.appendChild(this._dropdown);
    };
    /**
     * @private
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._updatePosition = /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var select = this._select.getBoundingClientRect();
        /** @type {?} */
        var parent = this._parent.getBoundingClientRect();
        /** @type {?} */
        var offsetLeft = select.left - parent.left;
        this._setOffset(parent, select);
        this._dropdown.style.left = offsetLeft + 'px';
        this._dropdown.style.width = (select.width * this.resizeWidth) + 'px';
        this._dropdown.style.minWidth = (select.width * this.resizeWidth) + 'px';
    };
    /**
     * @private
     * @param {?} parent
     * @param {?} select
     * @return {?}
     */
    NgDropdownPanelComponent.prototype._setOffset = /**
     * @private
     * @param {?} parent
     * @param {?} select
     * @return {?}
     */
    function (parent, select) {
        /** @type {?} */
        var delta = select.height;
        if (this._currentPosition === 'top') {
            /** @type {?} */
            var offsetBottom = parent.bottom - select.bottom;
            this._dropdown.style.bottom = offsetBottom + delta + 'px';
            this._dropdown.style.top = 'auto';
        }
        else if (this._currentPosition === 'bottom') {
            /** @type {?} */
            var offsetTop = select.top - parent.top;
            this._dropdown.style.top = offsetTop + delta + 'px';
            this._dropdown.style.bottom = 'auto';
        }
    };
    NgDropdownPanelComponent.decorators = [
        { type: Component, args: [{
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    selector: 'ng-dropdown-panel',
                    template: "\n        <div *ngIf=\"headerTemplate\" class=\"ng-dropdown-header\">\n            <ng-container [ngTemplateOutlet]=\"headerTemplate\" [ngTemplateOutletContext]=\"{ searchTerm: filterValue }\"></ng-container>\n        </div>\n        <div #scroll class=\"ng-dropdown-panel-items scroll-host\">\n            <div #padding [class.total-padding]=\"virtualScroll\"></div>\n            <div #content [class.scrollable-content]=\"virtualScroll && items.length\">\n                <ng-content></ng-content>\n            </div>\n        </div>\n        <ng-content select=\".footer\"></ng-content>\n        <div *ngIf=\"footerTemplate\" class=\"ng-dropdown-footer\">\n            <ng-container [ngTemplateOutlet]=\"footerTemplate\" [ngTemplateOutletContext]=\"{ searchTerm: filterValue }\"></ng-container>\n        </div>\n    "
                }] }
    ];
    /** @nocollapse */
    NgDropdownPanelComponent.ctorParameters = function () { return [
        { type: Renderer2 },
        { type: NgZone },
        { type: NgDropdownPanelService },
        { type: ElementRef },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
    ]; };
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
    return NgDropdownPanelComponent;
}());
export { NgDropdownPanelComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZHJvcGRvd24tcGFuZWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLXNlbGVjdC9uZy1zZWxlY3QvIiwic291cmNlcyI6WyJsaWIvbmctZHJvcGRvd24tcGFuZWwuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFDSCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUlOLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUVULFdBQVcsRUFDWCxTQUFTLEVBQ1QsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDekYsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsc0JBQXNCLEVBQW1CLE1BQU0sNkJBQTZCLENBQUM7QUFJdEYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7SUFFcEMsYUFBYSxHQUFHLGVBQWU7O0lBQy9CLGdCQUFnQixHQUFHLGtCQUFrQjs7SUFDckMsZ0JBQWdCLEdBQUcsT0FBTyxxQkFBcUIsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxhQUFhO0FBRS9HO0lBcURJLGtDQUNZLFNBQW9CLEVBQ3BCLEtBQWEsRUFDYixhQUFxQyxFQUM3QyxXQUF1QixFQUNlLFNBQWM7UUFKNUMsY0FBUyxHQUFULFNBQVMsQ0FBVztRQUNwQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2Isa0JBQWEsR0FBYixhQUFhLENBQXdCO1FBRVAsY0FB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QUE2Qzs7SUFDN0MsNENBQTBCOztJQUMxQixnREFBc0I7O0lBQ3RCLGlEQUErQjs7SUFDL0Isa0RBQTBDOztJQUMxQyxrREFBMEM7O0lBQzFDLCtDQUFvQzs7SUFDcEMsK0NBQWlDOztJQUVqQywwQ0FBNkM7O0lBQzdDLDBDQUFzRTs7SUFDdEUsK0NBQWlEOztJQUNqRCxnREFBa0Q7O0lBRWxELHFEQUF3Rjs7SUFDeEYsb0RBQXNGOztJQUN0RixxREFBd0Y7Ozs7O0lBRXhGLDZDQUFpRDs7Ozs7SUFDakQsNkNBQXdDOzs7OztJQUN4QyxtREFBcUM7Ozs7O0lBQ3JDLG9EQUFzQzs7Ozs7SUFDdEMsaURBQW1DOzs7OztJQUNuQywyQ0FBNkI7Ozs7O0lBQzdCLDJDQUE2Qjs7Ozs7SUFDN0IscURBQWtDOzs7OztJQUNsQyx1REFBb0M7Ozs7O0lBQ3BDLHVEQUFnQzs7Ozs7SUFZaEMsb0RBQTJDOzs7OztJQU0zQyxnREFBNkI7Ozs7O0lBZnpCLDZDQUE0Qjs7Ozs7SUFDNUIseUNBQXFCOzs7OztJQUNyQixpREFBNkM7Ozs7O0lBRTdDLDZDQUFvRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gICAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgQ29tcG9uZW50LFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIEhvc3RMaXN0ZW5lcixcbiAgICBJbmplY3QsXG4gICAgSW5wdXQsXG4gICAgTmdab25lLFxuICAgIE9uQ2hhbmdlcyxcbiAgICBPbkRlc3Ryb3ksXG4gICAgT25Jbml0LFxuICAgIE9wdGlvbmFsLFxuICAgIE91dHB1dCxcbiAgICBSZW5kZXJlcjIsXG4gICAgU2ltcGxlQ2hhbmdlcyxcbiAgICBUZW1wbGF0ZVJlZixcbiAgICBWaWV3Q2hpbGQsXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBhbmltYXRpb25GcmFtZVNjaGVkdWxlciwgYXNhcFNjaGVkdWxlciwgZnJvbUV2ZW50LCBtZXJnZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgYXVkaXRUaW1lLCB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBOZ0Ryb3Bkb3duUGFuZWxTZXJ2aWNlLCBQYW5lbERpbWVuc2lvbnMgfSBmcm9tICcuL25nLWRyb3Bkb3duLXBhbmVsLnNlcnZpY2UnO1xuXG5pbXBvcnQgeyBEcm9wZG93blBvc2l0aW9uIH0gZnJvbSAnLi9uZy1zZWxlY3QuY29tcG9uZW50JztcbmltcG9ydCB7IE5nT3B0aW9uIH0gZnJvbSAnLi9uZy1zZWxlY3QudHlwZXMnO1xuaW1wb3J0IHsgaXNEZWZpbmVkIH0gZnJvbSAnLi92YWx1ZS11dGlscyc7XG5cbmNvbnN0IFRPUF9DU1NfQ0xBU1MgPSAnbmctc2VsZWN0LXRvcCc7XG5jb25zdCBCT1RUT01fQ1NTX0NMQVNTID0gJ25nLXNlbGVjdC1ib3R0b20nO1xuY29uc3QgU0NST0xMX1NDSEVEVUxFUiA9IHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnID8gYW5pbWF0aW9uRnJhbWVTY2hlZHVsZXIgOiBhc2FwU2NoZWR1bGVyO1xuXG5AQ29tcG9uZW50KHtcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAgIHNlbGVjdG9yOiAnbmctZHJvcGRvd24tcGFuZWwnLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxkaXYgKm5nSWY9XCJoZWFkZXJUZW1wbGF0ZVwiIGNsYXNzPVwibmctZHJvcGRvd24taGVhZGVyXCI+XG4gICAgICAgICAgICA8bmctY29udGFpbmVyIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImhlYWRlclRlbXBsYXRlXCIgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInsgc2VhcmNoVGVybTogZmlsdGVyVmFsdWUgfVwiPjwvbmctY29udGFpbmVyPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiAjc2Nyb2xsIGNsYXNzPVwibmctZHJvcGRvd24tcGFuZWwtaXRlbXMgc2Nyb2xsLWhvc3RcIj5cbiAgICAgICAgICAgIDxkaXYgI3BhZGRpbmcgW2NsYXNzLnRvdGFsLXBhZGRpbmddPVwidmlydHVhbFNjcm9sbFwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiAjY29udGVudCBbY2xhc3Muc2Nyb2xsYWJsZS1jb250ZW50XT1cInZpcnR1YWxTY3JvbGwgJiYgaXRlbXMubGVuZ3RoXCI+XG4gICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCIuZm9vdGVyXCI+PC9uZy1jb250ZW50PlxuICAgICAgICA8ZGl2ICpuZ0lmPVwiZm9vdGVyVGVtcGxhdGVcIiBjbGFzcz1cIm5nLWRyb3Bkb3duLWZvb3RlclwiPlxuICAgICAgICAgICAgPG5nLWNvbnRhaW5lciBbbmdUZW1wbGF0ZU91dGxldF09XCJmb290ZXJUZW1wbGF0ZVwiIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7IHNlYXJjaFRlcm06IGZpbHRlclZhbHVlIH1cIj48L25nLWNvbnRhaW5lcj5cbiAgICAgICAgPC9kaXY+XG4gICAgYFxufSlcbmV4cG9ydCBjbGFzcyBOZ0Ryb3Bkb3duUGFuZWxDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcblxuICAgIEBJbnB1dCgpIGl0ZW1zOiBOZ09wdGlvbltdID0gW107XG4gICAgQElucHV0KCkgbWFya2VkSXRlbTogTmdPcHRpb247XG4gICAgQElucHV0KCkgcG9zaXRpb246IERyb3Bkb3duUG9zaXRpb24gPSAnYXV0byc7XG4gICAgQElucHV0KCkgYXBwZW5kVG86IHN0cmluZztcbiAgICBASW5wdXQoKSBidWZmZXJBbW91bnQ7XG4gICAgQElucHV0KCkgdmlydHVhbFNjcm9sbCA9IGZhbHNlO1xuICAgIEBJbnB1dCgpIGhlYWRlclRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICAgIEBJbnB1dCgpIGZvb3RlclRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICAgIEBJbnB1dCgpIGZpbHRlclZhbHVlOiBzdHJpbmcgPSBudWxsO1xuICAgIEBJbnB1dCgpIHJlc2l6ZVdpZHRoOiBudW1iZXIgPSAxO1xuXG4gICAgQE91dHB1dCgpIHVwZGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55W10+KCk7XG4gICAgQE91dHB1dCgpIHNjcm9sbCA9IG5ldyBFdmVudEVtaXR0ZXI8eyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlciB9PigpO1xuICAgIEBPdXRwdXQoKSBzY3JvbGxUb0VuZCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcbiAgICBAT3V0cHV0KCkgb3V0c2lkZUNsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuXG4gICAgQFZpZXdDaGlsZCgnY29udGVudCcsIHsgcmVhZDogRWxlbWVudFJlZiwgc3RhdGljOiB0cnVlIH0pIGNvbnRlbnRFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuICAgIEBWaWV3Q2hpbGQoJ3Njcm9sbCcsIHsgcmVhZDogRWxlbWVudFJlZiwgc3RhdGljOiB0cnVlIH0pIHNjcm9sbEVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgncGFkZGluZycsIHsgcmVhZDogRWxlbWVudFJlZiwgc3RhdGljOiB0cnVlIH0pIHBhZGRpbmdFbGVtZW50UmVmOiBFbGVtZW50UmVmO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveSQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2Ryb3Bkb3duOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF92aXJ0dWFsUGFkZGluZzogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfc2Nyb2xsYWJsZVBhbmVsOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF9jb250ZW50UGFuZWw6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX3NlbGVjdDogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfcGFyZW50OiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF9zY3JvbGxUb0VuZEZpcmVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfdXBkYXRlU2Nyb2xsSGVpZ2h0ID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfbGFzdFNjcm9sbFBvc2l0aW9uID0gMDtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIF9yZW5kZXJlcjogUmVuZGVyZXIyLFxuICAgICAgICBwcml2YXRlIF96b25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgX3BhbmVsU2VydmljZTogTmdEcm9wZG93blBhbmVsU2VydmljZSxcbiAgICAgICAgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRE9DVU1FTlQpIHByaXZhdGUgX2RvY3VtZW50OiBhbnlcbiAgICApIHtcbiAgICAgICAgdGhpcy5fZHJvcGRvd24gPSBfZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2N1cnJlbnRQb3NpdGlvbjogRHJvcGRvd25Qb3NpdGlvbjtcblxuICAgIGdldCBjdXJyZW50UG9zaXRpb24oKTogRHJvcGRvd25Qb3NpdGlvbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50UG9zaXRpb247XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaXRlbXNMZW5ndGg6IG51bWJlcjtcblxuICAgIHByaXZhdGUgZ2V0IGl0ZW1zTGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXRlbXNMZW5ndGg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXQgaXRlbXNMZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgICAgICBpZiAodmFsdWUgIT09IHRoaXMuX2l0ZW1zTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLl9pdGVtc0xlbmd0aCA9IHZhbHVlO1xuICAgICAgICAgICAgdGhpcy5fb25JdGVtc0xlbmd0aENoYW5nZWQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IF9zdGFydE9mZnNldCgpIHtcbiAgICAgICAgaWYgKHRoaXMubWFya2VkSXRlbSkge1xuICAgICAgICAgICAgY29uc3QgeyBpdGVtSGVpZ2h0LCBwYW5lbEhlaWdodCB9ID0gdGhpcy5fcGFuZWxTZXJ2aWNlLmRpbWVuc2lvbnM7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLm1hcmtlZEl0ZW0uaW5kZXggKiBpdGVtSGVpZ2h0O1xuICAgICAgICAgICAgcmV0dXJuIHBhbmVsSGVpZ2h0ID4gb2Zmc2V0ID8gMCA6IG9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCdtb3VzZWRvd24nLCBbJyRldmVudCddKVxuICAgIGhhbmRsZU1vdXNlZG93bigkZXZlbnQ6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gJGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgaWYgKHRhcmdldC50YWdOYW1lID09PSAnSU5QVVQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdCA9IHRoaXMuX2Ryb3Bkb3duLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX3ZpcnR1YWxQYWRkaW5nID0gdGhpcy5wYWRkaW5nRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9zY3JvbGxhYmxlUGFuZWwgPSB0aGlzLnNjcm9sbEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5fY29udGVudFBhbmVsID0gdGhpcy5jb250ZW50RWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLl9oYW5kbGVTY3JvbGwoKTtcbiAgICAgICAgdGhpcy5faGFuZGxlT3V0c2lkZUNsaWNrKCk7XG4gICAgICAgIHRoaXMuX2FwcGVuZERyb3Bkb3duKCk7XG4gICAgfVxuXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICBpZiAoY2hhbmdlcy5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gY2hhbmdlcy5pdGVtcztcbiAgICAgICAgICAgIHRoaXMuX29uSXRlbXNDaGFuZ2UoY2hhbmdlLmN1cnJlbnRWYWx1ZSwgY2hhbmdlLmZpcnN0Q2hhbmdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLl9kZXN0cm95JC5uZXh0KCk7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kkLmNvbXBsZXRlKCk7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kkLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIGlmICh0aGlzLmFwcGVuZFRvKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDaGlsZCh0aGlzLl9kcm9wZG93bi5wYXJlbnROb2RlLCB0aGlzLl9kcm9wZG93bik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzY3JvbGxUbyhvcHRpb246IE5nT3B0aW9uLCBzdGFydEZyb21PcHRpb24gPSBmYWxzZSkge1xuICAgICAgICBpZiAoIW9wdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2Yob3B0aW9uKTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLml0ZW1zTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2Nyb2xsVG87XG4gICAgICAgIGlmICh0aGlzLnZpcnR1YWxTY3JvbGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1IZWlnaHQgPSB0aGlzLl9wYW5lbFNlcnZpY2UuZGltZW5zaW9ucy5pdGVtSGVpZ2h0O1xuICAgICAgICAgICAgc2Nyb2xsVG8gPSB0aGlzLl9wYW5lbFNlcnZpY2UuZ2V0U2Nyb2xsVG8oaW5kZXggKiBpdGVtSGVpZ2h0LCBpdGVtSGVpZ2h0LCB0aGlzLl9sYXN0U2Nyb2xsUG9zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaXRlbTogSFRNTEVsZW1lbnQgPSB0aGlzLl9kcm9wZG93bi5xdWVyeVNlbGVjdG9yKGAjJHtvcHRpb24uaHRtbElkfWApO1xuICAgICAgICAgICAgY29uc3QgbGFzdFNjcm9sbCA9IHN0YXJ0RnJvbU9wdGlvbiA/IGl0ZW0ub2Zmc2V0VG9wIDogdGhpcy5fbGFzdFNjcm9sbFBvc2l0aW9uO1xuICAgICAgICAgICAgc2Nyb2xsVG8gPSB0aGlzLl9wYW5lbFNlcnZpY2UuZ2V0U2Nyb2xsVG8oaXRlbS5vZmZzZXRUb3AsIGl0ZW0uY2xpZW50SGVpZ2h0LCBsYXN0U2Nyb2xsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0RlZmluZWQoc2Nyb2xsVG8pKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxhYmxlUGFuZWwuc2Nyb2xsVG9wID0gc2Nyb2xsVG87XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzY3JvbGxUb1RhZygpIHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLl9zY3JvbGxhYmxlUGFuZWw7XG4gICAgICAgIHBhbmVsLnNjcm9sbFRvcCA9IHBhbmVsLnNjcm9sbEhlaWdodCAtIHBhbmVsLmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICBhZGp1c3RQb3NpdGlvbigpIHtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBzZWxlY3QgPSB0aGlzLl9zZWxlY3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRoaXMuX3NldE9mZnNldChwYXJlbnQsIHNlbGVjdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlRHJvcGRvd25Qb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudFBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlQ3VycmVudFBvc2l0aW9uKHRoaXMuX2Ryb3Bkb3duKTtcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX2Ryb3Bkb3duLCBUT1BfQ1NTX0NMQVNTKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX2Ryb3Bkb3duLCBCT1RUT01fQ1NTX0NMQVNTKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX3NlbGVjdCwgVE9QX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9zZWxlY3QsIEJPVFRPTV9DU1NfQ0xBU1MpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9kcm9wZG93biwgQk9UVE9NX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9kcm9wZG93biwgVE9QX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9zZWxlY3QsIEJPVFRPTV9DU1NfQ0xBU1MpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5fc2VsZWN0LCBUT1BfQ1NTX0NMQVNTKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFwcGVuZFRvKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVTY3JvbGwoKSB7XG4gICAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgZnJvbUV2ZW50KHRoaXMuc2Nyb2xsRWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCAnc2Nyb2xsJylcbiAgICAgICAgICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSQpLCBhdWRpdFRpbWUoMCwgU0NST0xMX1NDSEVEVUxFUikpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoZTogeyB0YXJnZXQ6IEhUTUxFbGVtZW50IH0pID0+IHRoaXMuX29uQ29udGVudFNjcm9sbGVkKGUudGFyZ2V0LnNjcm9sbFRvcCkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVPdXRzaWRlQ2xpY2soKSB7XG4gICAgICAgIGlmICghdGhpcy5fZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgbWVyZ2UoXG4gICAgICAgICAgICAgICAgZnJvbUV2ZW50KHRoaXMuX2RvY3VtZW50LCAndG91Y2hzdGFydCcsIHsgY2FwdHVyZTogdHJ1ZSB9KSxcbiAgICAgICAgICAgICAgICBmcm9tRXZlbnQodGhpcy5fZG9jdW1lbnQsICdtb3VzZWRvd24nLCB7IGNhcHR1cmU6IHRydWUgfSlcbiAgICAgICAgICAgICkucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSQpKVxuICAgICAgICAgICAgIC5zdWJzY3JpYmUoJGV2ZW50ID0+IHRoaXMuX2NoZWNrVG9DbG9zZSgkZXZlbnQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2hlY2tUb0Nsb3NlKCRldmVudDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3QuY29udGFpbnMoJGV2ZW50LnRhcmdldCkgfHwgdGhpcy5fZHJvcGRvd24uY29udGFpbnMoJGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhdGggPSAkZXZlbnQucGF0aCB8fCAoJGV2ZW50LmNvbXBvc2VkUGF0aCAmJiAkZXZlbnQuY29tcG9zZWRQYXRoKCkpO1xuICAgICAgICBpZiAoJGV2ZW50LnRhcmdldCAmJiAkZXZlbnQudGFyZ2V0LnNoYWRvd1Jvb3QgJiYgcGF0aCAmJiBwYXRoWzBdICYmIHRoaXMuX3NlbGVjdC5jb250YWlucyhwYXRoWzBdKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fem9uZS5ydW4oKCkgPT4gdGhpcy5vdXRzaWRlQ2xpY2suZW1pdCgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vbkl0ZW1zQ2hhbmdlKGl0ZW1zOiBOZ09wdGlvbltdLCBmaXJzdENoYW5nZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXMgfHwgW107XG4gICAgICAgIHRoaXMuX3Njcm9sbFRvRW5kRmlyZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pdGVtc0xlbmd0aCA9IGl0ZW1zLmxlbmd0aDtcblxuICAgICAgICBpZiAodGhpcy52aXJ0dWFsU2Nyb2xsKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVJdGVtc1JhbmdlKGZpcnN0Q2hhbmdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1zKGZpcnN0Q2hhbmdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZUl0ZW1zKGZpcnN0Q2hhbmdlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMudXBkYXRlLmVtaXQodGhpcy5pdGVtcyk7XG4gICAgICAgIGlmIChmaXJzdENoYW5nZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSB0aGlzLl9zY3JvbGxhYmxlUGFuZWwuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhbmVsU2VydmljZS5zZXREaW1lbnNpb25zKDAsIHBhbmVsSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVEcm9wZG93blBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxUbyh0aGlzLm1hcmtlZEl0ZW0sIGZpcnN0Q2hhbmdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVJdGVtc1JhbmdlKGZpcnN0Q2hhbmdlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbWVhc3VyZURpbWVuc2lvbnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVySXRlbXNSYW5nZSh0aGlzLl9zdGFydE9mZnNldCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZURyb3Bkb3duUG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW5kZXJJdGVtc1JhbmdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX29uQ29udGVudFNjcm9sbGVkKHNjcm9sbFRvcDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnZpcnR1YWxTY3JvbGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlckl0ZW1zUmFuZ2Uoc2Nyb2xsVG9wKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0U2Nyb2xsUG9zaXRpb24gPSBzY3JvbGxUb3A7XG4gICAgICAgIHRoaXMuX2ZpcmVTY3JvbGxUb0VuZChzY3JvbGxUb3ApO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZVZpcnR1YWxIZWlnaHQoaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuX3VwZGF0ZVNjcm9sbEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFBhZGRpbmcuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNjcm9sbEhlaWdodCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfb25JdGVtc0xlbmd0aENoYW5nZWQoKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVNjcm9sbEhlaWdodCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVuZGVySXRlbXNSYW5nZShzY3JvbGxUb3AgPSBudWxsKSB7XG4gICAgICAgIGlmIChzY3JvbGxUb3AgJiYgdGhpcy5fbGFzdFNjcm9sbFBvc2l0aW9uID09PSBzY3JvbGxUb3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjcm9sbFRvcCA9IHNjcm9sbFRvcCB8fCB0aGlzLl9zY3JvbGxhYmxlUGFuZWwuc2Nyb2xsVG9wO1xuICAgICAgICBjb25zdCByYW5nZSA9IHRoaXMuX3BhbmVsU2VydmljZS5jYWxjdWxhdGVJdGVtcyhzY3JvbGxUb3AsIHRoaXMuaXRlbXNMZW5ndGgsIHRoaXMuYnVmZmVyQW1vdW50KTtcbiAgICAgICAgdGhpcy5fdXBkYXRlVmlydHVhbEhlaWdodChyYW5nZS5zY3JvbGxIZWlnaHQpO1xuICAgICAgICB0aGlzLl9jb250ZW50UGFuZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVkoJHtyYW5nZS50b3BQYWRkaW5nfXB4KWA7XG5cbiAgICAgICAgdGhpcy5fem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGUuZW1pdCh0aGlzLml0ZW1zLnNsaWNlKHJhbmdlLnN0YXJ0LCByYW5nZS5lbmQpKTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsLmVtaXQoeyBzdGFydDogcmFuZ2Uuc3RhcnQsIGVuZDogcmFuZ2UuZW5kIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoaXNEZWZpbmVkKHNjcm9sbFRvcCkgJiYgdGhpcy5fbGFzdFNjcm9sbFBvc2l0aW9uID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxhYmxlUGFuZWwuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICAgICAgICAgICAgdGhpcy5fbGFzdFNjcm9sbFBvc2l0aW9uID0gc2Nyb2xsVG9wO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbWVhc3VyZURpbWVuc2lvbnMoKTogUHJvbWlzZTxQYW5lbERpbWVuc2lvbnM+IHtcbiAgICAgICAgaWYgKHRoaXMuX3BhbmVsU2VydmljZS5kaW1lbnNpb25zLml0ZW1IZWlnaHQgPiAwIHx8IHRoaXMuaXRlbXNMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fcGFuZWxTZXJ2aWNlLmRpbWVuc2lvbnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgW2ZpcnN0XSA9IHRoaXMuaXRlbXM7XG4gICAgICAgIHRoaXMudXBkYXRlLmVtaXQoW2ZpcnN0XSk7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fZHJvcGRvd24ucXVlcnlTZWxlY3RvcihgIyR7Zmlyc3QuaHRtbElkfWApO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uSGVpZ2h0ID0gb3B0aW9uLmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxQYWRkaW5nLnN0eWxlLmhlaWdodCA9IGAke29wdGlvbkhlaWdodCAqIHRoaXMuaXRlbXNMZW5ndGh9cHhgO1xuICAgICAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSB0aGlzLl9zY3JvbGxhYmxlUGFuZWwuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5fcGFuZWxTZXJ2aWNlLnNldERpbWVuc2lvbnMob3B0aW9uSGVpZ2h0LCBwYW5lbEhlaWdodCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYW5lbFNlcnZpY2UuZGltZW5zaW9ucztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZmlyZVNjcm9sbFRvRW5kKHNjcm9sbFRvcDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxUb0VuZEZpcmVkIHx8IHNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFkZGluZyA9IHRoaXMudmlydHVhbFNjcm9sbCA/XG4gICAgICAgICAgICB0aGlzLl92aXJ0dWFsUGFkZGluZyA6XG4gICAgICAgICAgICB0aGlzLl9jb250ZW50UGFuZWw7XG5cbiAgICAgICAgaWYgKHNjcm9sbFRvcCArIHRoaXMuX2Ryb3Bkb3duLmNsaWVudEhlaWdodCA+PSBwYWRkaW5nLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5fem9uZS5ydW4oKCkgPT4gdGhpcy5zY3JvbGxUb0VuZC5lbWl0KCkpO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsVG9FbmRGaXJlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9jYWxjdWxhdGVDdXJyZW50UG9zaXRpb24oZHJvcGRvd25FbDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gIT09ICdhdXRvJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0UmVjdDogQ2xpZW50UmVjdCA9IHRoaXMuX3NlbGVjdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3Qgb2Zmc2V0VG9wID0gc2VsZWN0UmVjdC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHNlbGVjdFJlY3QuaGVpZ2h0O1xuICAgICAgICBjb25zdCBkcm9wZG93bkhlaWdodCA9IGRyb3Bkb3duRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICBpZiAob2Zmc2V0VG9wICsgaGVpZ2h0ICsgZHJvcGRvd25IZWlnaHQgPiBzY3JvbGxUb3AgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RvcCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ2JvdHRvbSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9hcHBlbmREcm9wZG93bigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFwcGVuZFRvKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuYXBwZW5kVG8pO1xuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhcHBlbmRUbyBzZWxlY3RvciAke3RoaXMuYXBwZW5kVG99IGRpZCBub3QgZm91bmQgYW55IHBhcmVudCBlbGVtZW50YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuX2Ryb3Bkb3duKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVQb3NpdGlvbigpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ID0gdGhpcy5fc2VsZWN0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9wYXJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IG9mZnNldExlZnQgPSBzZWxlY3QubGVmdCAtIHBhcmVudC5sZWZ0O1xuXG4gICAgICAgIHRoaXMuX3NldE9mZnNldChwYXJlbnQsIHNlbGVjdCk7XG5cbiAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUubGVmdCA9IG9mZnNldExlZnQgKyAncHgnO1xuICAgICAgICB0aGlzLl9kcm9wZG93bi5zdHlsZS53aWR0aCA9IChzZWxlY3Qud2lkdGggKiB0aGlzLnJlc2l6ZVdpZHRoKSArICdweCc7XG4gICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLm1pbldpZHRoID0gKHNlbGVjdC53aWR0aCAqdGhpcy5yZXNpemVXaWR0aCkgKyAncHgnO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3NldE9mZnNldChwYXJlbnQ6IENsaWVudFJlY3QsIHNlbGVjdDogQ2xpZW50UmVjdCkge1xuICAgICAgICBjb25zdCBkZWx0YSA9IHNlbGVjdC5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldEJvdHRvbSA9IHBhcmVudC5ib3R0b20gLSBzZWxlY3QuYm90dG9tO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUuYm90dG9tID0gb2Zmc2V0Qm90dG9tICsgZGVsdGEgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUudG9wID0gJ2F1dG8nO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldFRvcCA9IHNlbGVjdC50b3AgLSBwYXJlbnQudG9wO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUudG9wID0gb2Zmc2V0VG9wICsgZGVsdGEgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19