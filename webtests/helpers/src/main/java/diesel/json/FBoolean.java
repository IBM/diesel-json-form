package diesel.json;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

import com.pojosontheweb.selenium.Findr;

public class FBoolean extends FJsonValue {

    FBoolean(JsPath path, Findr findr, boolean ignoreErrorTexts) {
        super(path, findr, ignoreErrorTexts);
    }

    private Findr findCheckbox() {
        return $$("input")
                .where(attrEquals("type", "checkbox"))
                .expectOne();
    }

    public FBoolean assertChecked(boolean checked) {
        findCheckbox().where(e -> e.isSelected() == checked).eval();
        return this;
    }

    public FBoolean clickCheckbox() {
        $$(".checkbox-wrapper label").expectOne().click();
        return this;
    }
}
