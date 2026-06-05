package diesel.json;

import com.pojosontheweb.selenium.Findr;
import diesel.json.util.Utility;
import org.openqa.selenium.Keys;

import static com.pojosontheweb.selenium.Findrs.*;

public class FString extends FRenderedElement {

    FString(JsPath path, Findr findr) {
        super(path, findr);
    }

    private Findr findInput() {
        return $("cds-text-input");
    }

    public FString assertValue(String expected) {
        findInput().where(attrEquals("value", expected)).eval();
        return this;
    }

    public FString assertNoError() {
        $$(".cds--form-requirement").count(0).eval();
        findInput().where(not(attrEquals("data-invalid", "true"))).eval();
        return this;
    }

    public FString assertHasError(String expected) {
        findInput().where(attrEquals("invalid", "true")).eval();
        findInput()
                .shadowRoot()
                .$$(".cds--form-requirement")
                .where(textEquals(expected))
                .expectOne()
                .eval();
        return this;
    }

    public FString setValue(String value) {
        Findr actualInput = findInput()
                .shadowRoot()
                .$$("input.cds--text-input")
                .expectOne();
        actualInput.click();
        actualInput.clear();
        actualInput.sendKeys(value);
        assertValue(value);
        return this;
    }

}
