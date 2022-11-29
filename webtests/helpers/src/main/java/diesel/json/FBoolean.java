package diesel.json;

import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.WebElement;

import java.util.function.Predicate;

import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.not;

public class FBoolean extends FJsonValue {

    FBoolean(JsPath path, Findr findr) {
        super(path, findr);
    }

    private Findr findCheckbox() {
        return $$("input")
                .where(attrEquals("type", "checkbox"))
                .expectOne();
    }


    public FBoolean assertChecked(boolean checked) {
        findCheckbox().where(e ->
            e.isSelected() == checked
        ).eval();
        return this;
    }

    public FBoolean clickCheckbox() {
        $$(".checkbox-wrapper label").expectOne().click();
        return this;
    }
}
