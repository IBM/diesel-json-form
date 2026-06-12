package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.JavascriptExecutor;

import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FCarbonComboBox extends AbstractPageObject {

    public FCarbonComboBox(Findr findr) {
        super(findr);
    }

    private Findr fTriggerButton = getFindr()
            .shadowRoot().$$("div")
            .where(attrEquals("part", "trigger-button"))
            .expectOne();

    public FCarbonComboBox selectValue(String value) {
        fTriggerButton.click();

        $$("cds-combo-box-item")
                .where(attrEquals("value", value))
                .at(0)
                .eval(e -> {
                    ((JavascriptExecutor) getDriver()).executeScript(
                            "arguments[0].scrollIntoView(true);", e);
                    e.click();
                    return true;
                });
        return this;
    }

    public FCarbonComboBox assertValue(String expected) {
        getFindr()
                .where(attrEquals("value", expected))
                .eval();
        return this;
    }

    public FCarbonComboBox assertHasError(String expected) {
        getFindr().where(attrEquals("invalid", "true")).eval();
        getFindr().where(attrEquals("invalid-text", expected)).eval();
        return this;
    }
}
