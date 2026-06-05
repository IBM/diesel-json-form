package diesel.json;

import com.pojosontheweb.selenium.Findr;
import static com.pojosontheweb.selenium.Findrs.attrEquals;

public class FBoolean extends FRenderedElement {

    FBoolean(JsPath path, Findr findr) {
        super(path, findr);
    }

    private Findr findCheckbox() {
        return $("input")
                .where(attrEquals("type", "checkbox"));
    }

    public FBoolean assertChecked(boolean checked) {
        findCheckbox().where(e -> e.isSelected() == checked).eval();
        return this;
    }

    public FBoolean clickCheckbox() {
        $("label.cds--checkbox-label").click();
        return this;
    }
}
