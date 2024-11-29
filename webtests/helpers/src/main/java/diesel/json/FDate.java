package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FDate extends FJsonValue{

    private Findr findInput() {
        return $("#input-");
    }

    FDate(JsPath path, Findr findr) {
        super(path, findr);
    }
    public FDate assertValue(String expected) {
        findInput().where(attrEquals("value", expected)).eval();
        return this;
    }
    public FDate assertNoError() {
        $$(".cds--form-requirement").count(0).eval();
        findInput().where(not(attrEquals("data-invalid", "true"))).eval();
        return this;
    }
    public FDate assertHasError(String expectedError){
        $$(".cds--form-requirement")
                .at(0)
                .where(textEquals(expectedError)).eval();
        return this;
    }

    public FDate setValue(String value) {
        findInput().clear();
        findInput().sendKeys(value);
        return this;
    }
}
