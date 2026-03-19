package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FNumber extends FJsonValue {

    FNumber(JsPath path, Findr findr) {
        super(path, findr);
    }

    public Findr findInput() {
        return $("#input-" + this.path.format("_"));
    }

    public FNumber assertValue(String expected) {
        findInput().where(attrEquals("value", expected)).eval();
        return this;
    }

    public FNumber assertHasError(String expected) {
        $$(".cds--form-requirement").where(textEquals(expected)).count(1).eval();
        findInput().where((attrEquals("data-invalid", "true"))).eval();
        return this;
    }

    public FNumber assertNoError() {
        $$(".cds--form-requirement").count(0).eval();
        findInput().where(not(attrEquals("data-invalid", "true"))).eval();

        return this;
    }

    public FNumber setValue(String value) {
        findInput().clear();
        findInput().sendKeys(value);
        return this;
    }
}
