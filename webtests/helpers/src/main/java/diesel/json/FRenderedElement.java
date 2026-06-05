package diesel.json;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;

public abstract class FRenderedElement extends AbstractPageObject {

    public final JsPath path;

    FRenderedElement(JsPath path, Findr form) {
        super(form.$$("*").where(attrEquals("json-form-path", path.format())).expectOne());
        this.path = path;
    }

}
