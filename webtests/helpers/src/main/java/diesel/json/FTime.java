package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FTime extends FRenderedElement {

    private Findr findPicker() {
        return $("my-time-picker");
    }

    private Findr findPickerInput() {
        return findPicker()
                .$("cds-time-picker")
                .shadowRoot()
                .$$("input.cds--time-picker__input-field")
                .expectOne();
    }

    FTime(Findr findr) {
        super(findr);
    }

    public FTime assertValue(String expected) {
        findPicker()
                .$("cds-time-picker")
                .where(attrEquals("value", expected))
                .eval();
        return this;
    }

    public FTime assertNoError() {
        findPicker()
                .$("cds-time-picker")
                .where(not(attrEquals("invalid", "true")))
                .eval();
        return this;
    }

    public FTime assertHasError(String expectedError) {
        findPicker()
                .$("cds-time-picker")
                .where(attrEquals("invalid-text", expectedError))
                .eval();
        return this;
    }

    public FTime setValue(String value) {
        findPickerInput().clear();
        findPickerInput().sendKeys(value);
        return this;
    }
}
