package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FDate extends FRenderedElement {

    FDate(JsPath path, Findr findr) {
        super(path, findr);
    }

    private Findr findPicker() {
        return $("my-date-picker");
    }

    private Findr findPickerInput() {
        return findPicker().$("cds-date-picker-input");
    }

    public FDate assertValue(String expected) {
        findPickerInput().where(attrEquals("value", expected)).eval();
        return this;
    }

    public FDate assertNoError() {
        $$(".cds--form-requirement").count(0).eval();
        findPickerInput().where(not(attrEquals("invalid", "true"))).eval();
        return this;
    }

    public FDate assertHasError(String expectedError) {
        findPickerInput()
                .where(attrEquals("invalid-text", expectedError)).eval();
        return this;
    }

    public FDate setValue(String value) {
        findPickerInput().clear();
        findPickerInput().sendKeys(value);
        return this;
    }
}
