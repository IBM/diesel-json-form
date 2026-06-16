package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

import static com.pojosontheweb.selenium.Findrs.*;

public class FMenu extends AbstractPageObject {

    public FMenu(Findr findr) {
        super(findr);
    }

    private Findr findMenu() {
        return $$("cds-menu").expectOne();
    }

    private Findr findMenuItem(String itemText) {
        return findMenu()
                .$$("cds-menu-item")
                .where(attrEquals("label", itemText))
                .where(isDisplayed())
                .at(0);
    }

    private void clickMenuItem(String itemText) {
        findMenuItem(itemText).click();
    }

    private void hoverMenuItem(String itemText) {
        findMenuItem(itemText).eval(e -> {
            new Actions(getDriver())
                    .moveToElement(e)
                    .build()
                    .perform();
            return true;
        });
    }

    public FAddProperty clickAddProperty() {
        clickMenuItem("Add property");
        return new FAddProperty();
    }

    public void clickChangeType(String type) {
        hoverMenuItem("Change type");
        clickMenuItem(type);
    }

    public void clickAddElement() {
        clickMenuItem("Add element");
    }

    public void clickDeleteElement() {
        clickMenuItem("Delete");
    }

    public void clickPropose(String type) {
        hoverMenuItem("Propose");
        clickMenuItem(type);
    }

    public FMenu assertMenuItemVisible(String label, boolean visible) {
        if (visible) {
            findMenuItem(label).eval();
        } else {
            findMenu()
                    .$$("cds-menu-item")
                    .where(attrEquals("label", label))
                    .count(0)
                    .eval();
        }
        return this;
    }

    public class FAddProperty {

        public FAddProperty setPropertyName(String foo) {
            var input = $$("cds-modal cds-text-input")
                    .where(attrEquals("placeholder", "Enter property name"))
                    .expectOne()
                    .shadowRoot()
                    .$$("input")
                    .where(attrEquals("placeholder", "Enter property name"))
                    .expectOne();
            input.clear();
            input.sendKeys(foo);
            return this;
        }

        public void clickAdd() {
            $$("cds-modal cds-modal-footer-button")
                    .where(attrEquals("kind", "primary"))
                    .expectOne()
                    .click();
        }
    }

}
