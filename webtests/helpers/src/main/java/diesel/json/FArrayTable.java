package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FArrayTable extends FRenderedElement {

    FArrayTable(Findr f) {
        super(f);
    }

    public FArrayTable assertRowCount(int expected) {
        findRows().count(expected).eval();
        return this;
    }

    private Findr.ListFindr findRows() {
        return $$(":scope > cds-table > cds-table-body > cds-table-row");
    }

    public FString stringAt(int col, int row) {
        Findr cell = findRows()
                .at(row)
                .$$(":scope > cds-table-cell")
                .at(col)
                .$(":scope > *");
        return new FString(cell);
    }

    public FArrayTable clickAddElement() {
        $$(":scope > cds-table > cds-table-toolbar .json-add-element")
                .expectOne()
                .click();
        return this;
    }

    public FArrayTable selectRows(int... rows) {
        for (int row : rows) {
            Findr fCheckbox = findRows()
                    .at(row)
                    .shadowRoot()
                    .$$("cds-checkbox")
                    .where(attrEquals("label-text", "Select row"))
                    .expectOne();
            fCheckbox
                    .shadowRoot()
                    .$$("label.cds--checkbox-label")
                    .expectOne()
                    .click();
        }
        return this;
    }

    public FArrayTable clickDelete() {
        $$(":scope > cds-table > cds-table-toolbar cds-button")
                .where(textEquals("Delete"))
                .expectOne()
                .click();
        return this;
    }
}
