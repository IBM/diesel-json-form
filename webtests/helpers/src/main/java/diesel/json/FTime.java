package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FTime extends FJsonValue{

    private Findr findInput() {
        return $("#time-picker-");
    }

    FTime(JsPath path, Findr findr) {
        super(path, findr);
    }
    public FTime assertValue(String expected) {
        findInput().where(attrEquals("value", expected)).eval();
        return this;
    }
    public FTime assertNoError() {
        $$(".bx--form-requirement").count(0).eval();
        findInput().where(not(attrEquals("data-invalid", "true"))).eval();
        return this;
    }
    public FTime assertHasError(String expectedError){
        $$(".bx--form-requirement")
                .at(0)
                .where(textEquals(expectedError)).eval();
        return this;
    }

    public FTime setValue(String value) {
        findInput().clear();
        findInput().sendKeys(value);
        return this;
    }
}
