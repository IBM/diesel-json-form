package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

public class FJsonForm extends AbstractPageObject {

    private final Findr fRoot;
    private final boolean ignoreErrorTexts;

    public FJsonForm(Findr findr, String cssSelector) {
        super(findr.$$(cssSelector).expectOne());
        this.fRoot = findr;
        this.ignoreErrorTexts = false;
    }

    private FJsonForm(FJsonForm form, boolean ignoreErrorTexts) {
        super(form.getFindr());
        this.fRoot = form.fRoot;
        this.ignoreErrorTexts = ignoreErrorTexts;
    }

    public FJsonForm ignoreErrorTexts() {
        return new FJsonForm(this, true);
    }

    private Findr findValueNode(JsPath path) {
        return $$("div.value")
                .where(attrEquals("data-path", path.format()))
                .expectOne();
    }

    public FObject objectAt(JsPath path) {
        return new FObject(fRoot, path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FNumber numberAt(JsPath path) {
        return new FNumber(path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FString stringAt(JsPath path) {
        return new FString(path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FArray arrayAt(JsPath path) {
        return new FArray(fRoot, path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FBoolean booleanAt(JsPath path) {
        return new FBoolean(path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FDate dateAt(JsPath path) {
        return new FDate(path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FTime timeAt(JsPath path) {
        return new FTime(path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FSelect selectAt(JsPath path) {
        return new FSelect(path, findValueNode(path), this.ignoreErrorTexts);
    }

    public FJsonForm assertMenuClosed() {
        $$(".tm").count(0).eval();
        return this;
    }

    public FMenu clickRootMenu() {
        $$(".doc-root .cds--tooltip-trigger__wrapper button")
                .expectOne()
                .click();
        return new FMenu(fRoot);
    }

}
