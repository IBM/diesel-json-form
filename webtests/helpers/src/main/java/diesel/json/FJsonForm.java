package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;

public class FJsonForm extends AbstractPageObject {

    private final Findr fRoot;

    public FJsonForm(Findr findr, String cssSelector) {
        super(findr.$$(cssSelector).expectOne());
        this.fRoot = findr;
    }

    public FObject objectAt(JsPath path) {
        return new FObject(fRoot, path, getFindr());
    }

    public FNumber numberAt(JsPath path) {
        return new FNumber(path, getFindr());
    }

    public FString stringAt(JsPath path) {
        return new FString(path, getFindr());
    }

    public FArray arrayAt(JsPath path) {
        return new FArray(fRoot, path, getFindr());
    }

    public FBoolean booleanAt(JsPath path) {
        return new FBoolean(path, getFindr());
    }

    public FDate dateAt(JsPath path) {
        return new FDate(path, getFindr());
    }

    public FTime timeAt(JsPath path) {
        return new FTime(path, getFindr());
    }

    public FJsonForm assertMenuClosed() {
        $$("cds-menu").count(0).eval();
        return this;
    }

    public FMenu clickRootMenu() {
        $$("json-form-header cds-button").expectOne().click();
        return new FMenu(fRoot);
    }

}
