package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.JavascriptExecutor;

import static com.pojosontheweb.selenium.Findrs.*;

public class FCarbonComboBox extends AbstractPageObject {

    public FCarbonComboBox(Findr findr) {
        super(findr);
    }

    private Findr fTriggerButton = getFindr()
            .shadowRoot().
            $$("div")
            .where(attrEquals("part", "trigger-button"))
            .expectOne();

    public FCarbonComboBox selectValue(String value) {
        fTriggerButton.click();

        $$("cds-dropdown-item")
                .where(textEquals(value))
                .at(0)
                .eval(e -> {
                    ((JavascriptExecutor) getDriver()).executeScript(
                            "arguments[0].scrollIntoView(true);", e
                    );
                    e.click();
                    return true;
                });
        return this;
    }

    public FCarbonComboBox assertValue(String expected) {
        fTriggerButton
                .$$("span.cds--list-box__label")
                .expectOne()
                .where(textEquals(expected))
                .eval();
        return this;
    }

}
