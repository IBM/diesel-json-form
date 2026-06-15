package diesel.json;

import com.pojosontheweb.selenium.Findr;
import static com.pojosontheweb.selenium.Findrs.attrEquals;

public class FBoolean extends FRenderedElement {

    FBoolean(Findr findr) {
        super(findr);
    }

    private Findr findCheckbox() {
        return $("cds-checkbox")
                .shadowRoot()
                .$$("input")
                .where(attrEquals("type", "checkbox"))
                .expectOne();
    }

    public FBoolean assertChecked(boolean checked) {
        findCheckbox().where(e -> e.isSelected() == checked).eval();
        return this;
    }

    public FBoolean clickCheckbox() {
        $("cds-checkbox")
                .shadowRoot()
                .$$("label.cds--checkbox-label")
                .expectOne()
                .click();
        return this;
    }
}
