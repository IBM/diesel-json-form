package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FNumber extends FJsonValue {

    FNumber(JsPath path, Findr findr) {
        super(path, findr);
    }

    private Findr findInput() {
        return $("#input-" + this.path.format("_"));
    }

    public FNumber assertValue(int expected) {
        findInput().where(attrEquals("value", Integer.toString(expected))).eval();
        return this;
    }

    public FNumber assertHasError() {
        $$(".bx--form-requirement").count(0).eval();
        findInput().where((attrEquals("data-invalid", "true"))).eval();
        return this;
    }

    public FNumber assertNoError() {
        $$(".bx--form-requirement").count(0).eval();
        findInput().where(not(attrEquals("data-invalid", "true"))).eval();
        return this;
    }

    public FNumber setValue(int value) {
        findInput().clear();
        findInput().sendKeys(Integer.toString(value));
        return this;
    }
}
