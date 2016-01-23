import {Directive, ElementRef, Renderer} from "angular2/core";

// Services
import {MdPreviewRef} from "../services/MdPreviewRef";

@Directive({
    selector: "[copy-btn-drv]",
    host: {
        "(click)": "onClick()"
    }
})
export class CopyButtonDirective {
    public static SUCC_CLASS: string = "success";
    public static ERR_CLASS: string = "error";
    public static SHOW_TIME: number = 350; // ms

    private _elem: ElementRef;
    private _renderer: Renderer;

    constructor(elem: ElementRef, renderer: Renderer) {
        this._elem = elem;
        this._renderer = renderer;
    }

    public onClick() {
        var isSuccessful,
            self: this = this;

        MdPreviewRef.ref.focus();
        MdPreviewRef.ref.setSelectionRange(0, 9999);

        try {
            isSuccessful = document.execCommand("copy");

            if (isSuccessful) {
                this.setButtonClass(CopyButtonDirective.SUCC_CLASS, true);
            } else {
                this.setButtonClass(CopyButtonDirective.ERR_CLASS, true);
            }
        } catch (err) {
            this.setButtonClass(CopyButtonDirective.ERR_CLASS, true);
        }

        setTimeout(function () {
            self.setButtonClass(CopyButtonDirective.SUCC_CLASS, false);
            self.setButtonClass(CopyButtonDirective.ERR_CLASS, false);
        }, CopyButtonDirective.SHOW_TIME);
    }

    private setButtonClass(className: string, isAdd: boolean) {
        this._renderer.setElementClass(this._elem, className, isAdd);
    }
}