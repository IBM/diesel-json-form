package diesel.json;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;

public abstract class FRenderedElement extends AbstractPageObject {

    FRenderedElement(Findr f) { //}, Findr f) {
//        super(form.$$("*").where(attrEquals("json-form-path", path.format())).expectOne());
        super(f);
    }

//    String getPathAttribute() {
//        return getFindr().eval(e -> e.getAttribute("json-form-path"));
//    }

}
