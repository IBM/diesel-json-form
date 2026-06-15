package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FDate extends FRenderedElement {

    FDate(Findr findr) {
        super(findr);
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
        findPickerInput().where(not(attrEquals("invalid", "true"))).eval();
        return this;
    }

    public FDate assertHasError(String expectedError) {
        findPickerInput()
                .where(attrEquals("invalid-text", expectedError)).eval();
        return this;
    }

    public FDate setValue(String value) {
        Findr input = findPickerInput()
            .shadowRoot()
            .$$("input.cds--date-picker__input")
            .expectOne();
        input.clear();
        input.sendKeys(value);
        return this;
    }
}
