/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
/**
 * @return {?}
 */
export function DefaultSelectionModelFactory() {
    return new DefaultSelectionModel();
}
/**
 * @record
 */
export function SelectionModel() { }
if (false) {
    /** @type {?} */
    SelectionModel.prototype.value;
    /**
     * @param {?} item
     * @param {?} multiple
     * @param {?} selectableGroupAsModel
     * @return {?}
     */
    SelectionModel.prototype.select = function (item, multiple, selectableGroupAsModel) { };
    /**
     * @param {?} item
     * @param {?} multiple
     * @return {?}
     */
    SelectionModel.prototype.unselect = function (item, multiple) { };
    /**
     * @param {?} keepDisabled
     * @return {?}
     */
    SelectionModel.prototype.clear = function (keepDisabled) { };
}
var DefaultSelectionModel = /** @class */ (function () {
    function DefaultSelectionModel() {
        this._selected = [];
    }
    Object.defineProperty(DefaultSelectionModel.prototype, "value", {
        get: /**
         * @return {?}
         */
        function () {
            return this._selected;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} item
     * @param {?} multiple
     * @param {?} groupAsModel
     * @return {?}
     */
    DefaultSelectionModel.prototype.select = /**
     * @param {?} item
     * @param {?} multiple
     * @param {?} groupAsModel
     * @return {?}
     */
    function (item, multiple, groupAsModel) {
        item.selected = true;
        if (!item.children || (!multiple && groupAsModel)) {
            this._selected.push(item);
        }
        if (multiple) {
            if (item.parent) {
                /** @type {?} */
                var childrenCount = item.parent.children.length;
                /** @type {?} */
                var selectedCount = item.parent.children.filter((/**
                 * @param {?} x
                 * @return {?}
                 */
                function (x) { return x.selected; })).length;
                item.parent.selected = childrenCount === selectedCount;
            }
            else if (item.children) {
                this._setChildrenSelectedState(item.children, true);
                this._removeChildren(item);
                if (groupAsModel && this._activeChildren(item)) {
                    this._selected = tslib_1.__spread(this._selected.filter((/**
                     * @param {?} x
                     * @return {?}
                     */
                    function (x) { return x.parent !== item; })), [item]);
                }
                else {
                    this._selected = tslib_1.__spread(this._selected, item.children.filter((/**
                     * @param {?} x
                     * @return {?}
                     */
                    function (x) { return !x.disabled; })));
                }
            }
        }
    };
    /**
     * @param {?} item
     * @param {?} multiple
     * @return {?}
     */
    DefaultSelectionModel.prototype.unselect = /**
     * @param {?} item
     * @param {?} multiple
     * @return {?}
     */
    function (item, multiple) {
        var _a;
        this._selected = this._selected.filter((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return x !== item; }));
        item.selected = false;
        if (multiple) {
            if (item.parent && item.parent.selected) {
                /** @type {?} */
                var children = item.parent.children;
                this._removeParent(item.parent);
                this._removeChildren(item.parent);
                (_a = this._selected).push.apply(_a, tslib_1.__spread(children.filter((/**
                 * @param {?} x
                 * @return {?}
                 */
                function (x) { return x !== item && !x.disabled; }))));
                item.parent.selected = false;
            }
            else if (item.children) {
                this._setChildrenSelectedState(item.children, false);
                this._removeChildren(item);
            }
        }
    };
    /**
     * @param {?} keepDisabled
     * @return {?}
     */
    DefaultSelectionModel.prototype.clear = /**
     * @param {?} keepDisabled
     * @return {?}
     */
    function (keepDisabled) {
        this._selected = keepDisabled ? this._selected.filter((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return x.disabled; })) : [];
    };
    /**
     * @private
     * @param {?} children
     * @param {?} selected
     * @return {?}
     */
    DefaultSelectionModel.prototype._setChildrenSelectedState = /**
     * @private
     * @param {?} children
     * @param {?} selected
     * @return {?}
     */
    function (children, selected) {
        var e_1, _a;
        try {
            for (var children_1 = tslib_1.__values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
                var child = children_1_1.value;
                if (child.disabled) {
                    continue;
                }
                child.selected = selected;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        ;
    };
    /**
     * @private
     * @param {?} parent
     * @return {?}
     */
    DefaultSelectionModel.prototype._removeChildren = /**
     * @private
     * @param {?} parent
     * @return {?}
     */
    function (parent) {
        this._selected = tslib_1.__spread(this._selected.filter((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return x.parent !== parent; })), parent.children.filter((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return x.parent === parent && x.disabled && x.selected; })));
    };
    /**
     * @private
     * @param {?} parent
     * @return {?}
     */
    DefaultSelectionModel.prototype._removeParent = /**
     * @private
     * @param {?} parent
     * @return {?}
     */
    function (parent) {
        this._selected = this._selected.filter((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return x !== parent; }));
    };
    /**
     * @private
     * @param {?} item
     * @return {?}
     */
    DefaultSelectionModel.prototype._activeChildren = /**
     * @private
     * @param {?} item
     * @return {?}
     */
    function (item) {
        return item.children.every((/**
         * @param {?} x
         * @return {?}
         */
        function (x) { return !x.disabled || x.selected; }));
    };
    return DefaultSelectionModel;
}());
export { DefaultSelectionModel };
if (false) {
    /**
     * @type {?}
     * @private
     */
    DefaultSelectionModel.prototype._selected;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLW1vZGVsLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLXNlbGVjdC9uZy1zZWxlY3QvIiwic291cmNlcyI6WyJsaWIvc2VsZWN0aW9uLW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBSUEsTUFBTSxVQUFVLDRCQUE0QjtJQUN4QyxPQUFPLElBQUkscUJBQXFCLEVBQUUsQ0FBQztBQUN2QyxDQUFDOzs7O0FBRUQsb0NBS0M7OztJQUpHLCtCQUFrQjs7Ozs7OztJQUNsQix3RkFBMkU7Ozs7OztJQUMzRSxrRUFBNEM7Ozs7O0lBQzVDLDZEQUE2Qjs7QUFHakM7SUFBQTtRQUNZLGNBQVMsR0FBZSxFQUFFLENBQUM7SUF3RXZDLENBQUM7SUF0RUcsc0JBQUksd0NBQUs7Ozs7UUFBVDtZQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDOzs7T0FBQTs7Ozs7OztJQUVELHNDQUFNOzs7Ozs7SUFBTixVQUFPLElBQWMsRUFBRSxRQUFpQixFQUFFLFlBQXFCO1FBQzNELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksWUFBWSxDQUFDLEVBQUU7WUFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0I7UUFDRCxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTs7b0JBQ1AsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU07O29CQUMzQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTTs7OztnQkFBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLEVBQVYsQ0FBVSxFQUFDLENBQUMsTUFBTTtnQkFDekUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFR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O0lBRU8sK0NBQWU7Ozs7O0lBQXZCLFVBQXdCLE1BQWdCO1FBQ3BDLElBQUksQ0FBQyxTQUFTLG9CQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTTs7OztRQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQW5CLENBQW1CLEVBQUMsRUFDL0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNOzs7O1FBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQS9DLENBQStDLEVBQUMsQ0FDbEYsQ0FBQztJQUNOLENBQUM7Ozs7OztJQUVPLDZDQUFhOzs7OztJQUFyQixVQUFzQixNQUFnQjtRQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTTs7OztRQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLE1BQU0sRUFBWixDQUFZLEVBQUMsQ0FBQTtJQUM3RCxDQUFDOzs7Ozs7SUFFTywrQ0FBZTs7Ozs7SUFBdkIsVUFBd0IsSUFBYztRQUNsQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSzs7OztRQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQXpCLENBQXlCLEVBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ0wsNEJBQUM7QUFBRCxDQUFDLEFBekVELElBeUVDOzs7Ozs7O0lBeEVHLDBDQUFtQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nT3B0aW9uIH0gZnJvbSAnLi9uZy1zZWxlY3QudHlwZXMnO1xuXG5leHBvcnQgdHlwZSBTZWxlY3Rpb25Nb2RlbEZhY3RvcnkgPSAoKSA9PiBTZWxlY3Rpb25Nb2RlbDtcblxuZXhwb3J0IGZ1bmN0aW9uIERlZmF1bHRTZWxlY3Rpb25Nb2RlbEZhY3RvcnkoKSB7XG4gICAgcmV0dXJuIG5ldyBEZWZhdWx0U2VsZWN0aW9uTW9kZWwoKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTZWxlY3Rpb25Nb2RlbCB7XG4gICAgdmFsdWU6IE5nT3B0aW9uW107XG4gICAgc2VsZWN0KGl0ZW06IE5nT3B0aW9uLCBtdWx0aXBsZTogYm9vbGVhbiwgc2VsZWN0YWJsZUdyb3VwQXNNb2RlbDogYm9vbGVhbik7XG4gICAgdW5zZWxlY3QoaXRlbTogTmdPcHRpb24sIG11bHRpcGxlOiBib29sZWFuKTtcbiAgICBjbGVhcihrZWVwRGlzYWJsZWQ6IGJvb2xlYW4pO1xufVxuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFNlbGVjdGlvbk1vZGVsIGltcGxlbWVudHMgU2VsZWN0aW9uTW9kZWwge1xuICAgIHByaXZhdGUgX3NlbGVjdGVkOiBOZ09wdGlvbltdID0gW107XG5cbiAgICBnZXQgdmFsdWUoKTogTmdPcHRpb25bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgICB9XG5cbiAgICBzZWxlY3QoaXRlbTogTmdPcHRpb24sIG11bHRpcGxlOiBib29sZWFuLCBncm91cEFzTW9kZWw6IGJvb2xlYW4pIHtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIGlmICghaXRlbS5jaGlsZHJlbiB8fCAoIW11bHRpcGxlICYmIGdyb3VwQXNNb2RlbCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkLnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbkNvdW50ID0gaXRlbS5wYXJlbnQuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQ291bnQgPSBpdGVtLnBhcmVudC5jaGlsZHJlbi5maWx0ZXIoeCA9PiB4LnNlbGVjdGVkKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaXRlbS5wYXJlbnQuc2VsZWN0ZWQgPSBjaGlsZHJlbkNvdW50ID09PSBzZWxlY3RlZENvdW50O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0Q2hpbGRyZW5TZWxlY3RlZFN0YXRlKGl0ZW0uY2hpbGRyZW4sIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNoaWxkcmVuKGl0ZW0pO1xuICAgICAgICAgICAgICAgIGlmIChncm91cEFzTW9kZWwgJiYgdGhpcy5fYWN0aXZlQ2hpbGRyZW4oaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0ZWQgPSBbLi4udGhpcy5fc2VsZWN0ZWQuZmlsdGVyKHggPT4geC5wYXJlbnQgIT09IGl0ZW0pLCBpdGVtXVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkID0gWy4uLnRoaXMuX3NlbGVjdGVkLCAuLi5pdGVtLmNoaWxkcmVuLmZpbHRlcih4ID0+ICF4LmRpc2FibGVkKV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdW5zZWxlY3QoaXRlbTogTmdPcHRpb24sIG11bHRpcGxlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gdGhpcy5fc2VsZWN0ZWQuZmlsdGVyKHggPT4geCAhPT0gaXRlbSk7XG4gICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICAgICAgICBpZiAoaXRlbS5wYXJlbnQgJiYgaXRlbS5wYXJlbnQuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGl0ZW0ucGFyZW50LmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZVBhcmVudChpdGVtLnBhcmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlQ2hpbGRyZW4oaXRlbS5wYXJlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkLnB1c2goLi4uY2hpbGRyZW4uZmlsdGVyKHggPT4geCAhPT0gaXRlbSAmJiAheC5kaXNhYmxlZCkpO1xuICAgICAgICAgICAgICAgIGl0ZW0ucGFyZW50LnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDaGlsZHJlblNlbGVjdGVkU3RhdGUoaXRlbS5jaGlsZHJlbiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZUNoaWxkcmVuKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXIoa2VlcERpc2FibGVkOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0ga2VlcERpc2FibGVkID8gdGhpcy5fc2VsZWN0ZWQuZmlsdGVyKHggPT4geC5kaXNhYmxlZCkgOiBbXTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9zZXRDaGlsZHJlblNlbGVjdGVkU3RhdGUoY2hpbGRyZW46IE5nT3B0aW9uW10sIHNlbGVjdGVkOiBib29sZWFuKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQuc2VsZWN0ZWQgPSBzZWxlY3RlZDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZW1vdmVDaGlsZHJlbihwYXJlbnQ6IE5nT3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gW1xuICAgICAgICAgICAgLi4udGhpcy5fc2VsZWN0ZWQuZmlsdGVyKHggPT4geC5wYXJlbnQgIT09IHBhcmVudCksIFxuICAgICAgICAgICAgLi4ucGFyZW50LmNoaWxkcmVuLmZpbHRlcih4ID0+IHgucGFyZW50ID09PSBwYXJlbnQgJiYgeC5kaXNhYmxlZCAmJiB4LnNlbGVjdGVkKVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlbW92ZVBhcmVudChwYXJlbnQ6IE5nT3B0aW9uKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gdGhpcy5fc2VsZWN0ZWQuZmlsdGVyKHggPT4geCAhPT0gcGFyZW50KVxuICAgIH1cblxuICAgIHByaXZhdGUgX2FjdGl2ZUNoaWxkcmVuKGl0ZW06IE5nT3B0aW9uKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBpdGVtLmNoaWxkcmVuLmV2ZXJ5KHggPT4gIXguZGlzYWJsZWQgfHwgeC5zZWxlY3RlZCk7XG4gICAgfVxufVxuIl19