package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.By;

import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FJsonForm extends AbstractPageObject {

    private final Findr fRoot;

    public FJsonForm(Findr findr, String cssSelector) {
        super(findr.$$(cssSelector).expectOne());
        this.fRoot = findr;
    }

    private Findr findValueNode(JsPath path) {
        return $$("div.value")
                .where(attrEquals("data-path", path.format()))
                .expectOne();
    }

    public FObject objectAt(JsPath path) {
        return new FObject(fRoot, path, findValueNode(path));
    }

    public FNumber numberAt(JsPath path) {
        return new FNumber(path, findValueNode(path));
    }

    public FString stringAt(JsPath path) {
        return new FString(path, findValueNode(path));
    }

    public FArray arrayAt(JsPath path) {
        return new FArray(fRoot, path, findValueNode(path));
    }

    public FBoolean booleanAt(JsPath path) {
        return new FBoolean(path, findValueNode(path));
    }

    public FDate dateAt(JsPath path){return new FDate(path, findValueNode(path));}

    public FTime timeAt(JsPath path){return new FTime(path, findValueNode(path));}

    public FSelect selectAt(JsPath path) {
        return new FSelect(path, findValueNode(path));
    }

    public FJsonForm assertMenuClosed() {
        $$(".tm").count(0).eval();
        return this;
    }

    public FMenu clickRootMenu() {
        $$(".doc-root button.djson--tooltip__trigger")
            .expectOne()
            .click();
        return new FMenu(fRoot);
    }

}
