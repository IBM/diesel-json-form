package diesel.json;

import com.pojosontheweb.selenium.Findr;

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
}
