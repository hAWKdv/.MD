import {Component, ElementRef} from "angular2/core";

// Services
import {TableService} from "../services/TableService";
import {SetClassNative} from "../../../services/SetClassNative";

@Component({
    selector: "[table-btn-cmp]",
    template: `
        <div class="disp"></div>
        <div class="cont">
            <div class="item-cont"></div>
        </div>`
})
export class TableButtonComponent {
    private static TABLE_SIZE: number = 5;
    private static HOV_CELL_CLASS: string = "hovered";
    private static CELL_CLASSES: string = "cell theme-bg-ev dd-close";

    private _elem: ElementRef;
    private _cellCont;
    private _cells;

    /**
     * Sets injected element reference and builds the table cell selector (generator) widget.
     * @param elem
     */
    constructor(elem: ElementRef) {
        this._elem = elem;
        this._cellCont = this._elem.nativeElement.childNodes[3].childNodes[1]; //todo

        this.buildTableCellSelector();
        this.bindCellsClickEvent();
    }

    /**
     * Builds table cell selector (generator) widget.
     */
    private buildTableCellSelector(): void {
        var cellContainer = document.createDocumentFragment(),
            pSize: number = TableButtonComponent.TABLE_SIZE * TableButtonComponent.TABLE_SIZE,
            col: number = 1,
            row: number = 1,
            cell,
            i: number;

        this._cells = [];

        for (i = 1; i <= pSize; i += 1) {
            cell = document.createElement("div");
            SetClassNative.add(cell, TableButtonComponent.CELL_CLASSES);
            cell.dataset.col = col;
            cell.dataset.row = row;
            this._cells.push(cell);

            cellContainer.appendChild(cell);

            col += 1;
            if (i % TableButtonComponent.TABLE_SIZE === 0) {
                row += 1;
                col = 1;
            }
        }

        this._cellCont.appendChild(cellContainer);
        this.bindHoverEventsForCells();
    }

    /**
     * Binds hover event to the cells (background changing).
     */
    private bindHoverEventsForCells(): void {
        var self = this;

        this._cells.forEach(function (cell: any) {
            cell.addEventListener("mouseenter", function () {
                self.cellHighlighter(this);
            });

            cell.addEventListener("mouseleave", function () {
                self.cellHighlighter(this);
            });
        });
    }

    /**
     * Sends clicked cell row and column to the .cellHighlighter().
     */
    private bindCellsClickEvent(): void {
        // For keeping focus on editor
        this._cellCont.addEventListener("mousedown", function (event) {
            event.preventDefault();
        });

        this._cellCont.addEventListener("click", function (event: any) {
            var elem = event.target,
                tableStr: string;

            if (elem && elem.className.indexOf("cell") !== -1) {
                tableStr = TableService.GenerateTable(elem.dataset.row, elem.dataset.col);

                document.execCommand("insertHTML", false, tableStr);
            }
        });
    }

    /**
     * Highlights the corresponding cells (top/left) according to the provided root cell.
     * @param elem - Root cell
     */
    private cellHighlighter(elem): void {
        var row = elem.dataset.row,
            col = elem.dataset.col,
            i, j;

        for (i = 1; i <= row; i += 1) {
            for (j = 1; j <= col; j += 1) {
                this._cells.forEach(function (cell: any) {
                    if (parseInt(cell.dataset.row) === i && parseInt(cell.dataset.col) === j) {
                        SetClassNative.toggle(cell, TableButtonComponent.HOV_CELL_CLASS);
                    }
                });
            }
        }
    }
}
