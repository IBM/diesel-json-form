package diesel.json;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Retry;

import static com.pojosontheweb.selenium.Findrs.*;

public class FNumber extends FRenderedElement {

    FNumber(JsPath path, Findr findr) {
        super(path, findr);
    }

    public Findr findInput() {
        return $("cds-text-input");
    }

    public FNumber assertValue(String expected) {
        findInput().where(attrEquals("value", expected)).eval();
        return this;
    }

    public FNumber assertHasError(String expected) {
        findInput().where(attrEquals("invalid", "true")).eval();
        findInput().where(attrEquals("invalid-text", expected)).eval();
        return this;
    }

    public FNumber assertNoError() {
        findInput().where(not(attrEquals("invalid", "true"))).eval();
        return this;
    }

    private Findr findActualInput() {
        return findInput()
                .shadowRoot()
                .$$("input.cds--text-input")
                .expectOne();
    }

    public FNumber setValue(String value) {
        Findr actualInput = findActualInput();
        actualInput.click();
        actualInput.clear();
        actualInput.sendKeys(value);
        assertValue(value);
        return this;
    }

    public FNumber sendKeys(CharSequence... keys) {
        Findr actualInput = findActualInput();
        actualInput.click();
        actualInput.sendKeys(keys);
        return this;
    }
}
