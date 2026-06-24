package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Retry;

import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.isDisplayed;

public class FJsonForm extends AbstractPageObject {

    private final Findr fRoot;

    private Findr findElementByPathPath(JsPath path) {
        return findByPath(fRoot, path);
    }

    public static Findr findByPath(Findr root, JsPath path) {
        return root.$$("*").where(attrEquals("json-form-path", path.format())).expectOne();
    }

    public FJsonForm(Findr findr, String cssSelector) {
        super(findr.$$(cssSelector).expectOne());
        this.fRoot = findr;
    }

    public FObject objectAt(JsPath path) {
        return new FObject(findElementByPathPath(path));
    }

    public FNumber numberAt(JsPath path) {
        return new FNumber(findElementByPathPath(path));
    }

    public FString stringAt(JsPath path) {
        return new FString(findElementByPathPath(path));
    }

    public FArray arrayAt(JsPath path) {
        return new FArray(fRoot, findElementByPathPath(path));
    }

    public FArrayTable arrayTableAt(JsPath path) {
        return new FArrayTable(findElementByPathPath(path));
    }

    public FBoolean booleanAt(JsPath path) {
        return new FBoolean(findElementByPathPath(path));
    }

    public FDate dateAt(JsPath path) {
        return new FDate(findElementByPathPath(path));
    }

    public FTime timeAt(JsPath path) {
        return new FTime(findElementByPathPath(path));
    }

    public FJsonForm assertMenuClosed() {
        $$("cds-menu").count(0).eval();
        return this;
    }

    public FSelect selectAt(JsPath path) {
        return new FSelect(findElementByPathPath(path));
    }

    public FMenu clickRootMenu() {
        Retry.retry()
                .add(() -> {
                    $$("carbon-json-form-header cds-button").expectOne().click();
                })
                .add(() -> fRoot.$$("cds-menu")
                        .where(isDisplayed())
                        .count(1))
                .eval();

        return new FMenu(fRoot);
    }

}
