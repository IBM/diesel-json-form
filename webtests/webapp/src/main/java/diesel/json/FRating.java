package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Findrs;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

public class FRating extends FRenderedElement {

    public FRating(JsPath path, Findr form) {
        super(path, form);
    }

    public FRating assertRating(int expected) {
        $$("cds-radio-button")
                .at(expected - 1)
                .where(attrEquals("checked", "true"))
                .eval();
        return this;
    }

    public FRating clickRating(int rating) {
        $$("cds-radio-button")
                .at(rating - 1)
                .click();
        return this;
    }
}
