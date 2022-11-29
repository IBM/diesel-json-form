package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.interactions.Actions;

import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FMenu extends AbstractPageObject {

    public FMenu(Findr findr) {
        super(findr);
    }

    private Findr findMenu(int index) {
        return $$(".diesel-json-editor-menu .tm")
                .at(index);
    }

    private Findr findMenuItem(int menuIndex, String itemText) {
        return findMenu(menuIndex)
                .$$(".menu-item span")
                .where(textEquals(itemText))
                .expectOne();
    }


    private void clickMenuItem(int menuIndex, String itemText) {
        findMenuItem(menuIndex, itemText).click();
    }

    private void hoverMenuItem(int menuIndex, String itemText) {
        findMenuItem(menuIndex, itemText).eval(e -> {
            new Actions(getDriver())
                    .moveToElement(e)
                    .build()
                    .perform();
            return true;
        });
    }

    public FAddProperty clickAddProperty() {
        clickMenuItem(0, "Add property...");
        return new FAddProperty();
    }

    public void clickChangeType(String type) {
        hoverMenuItem(0, "Change type");
        clickMenuItem(1, type);
    }

    public void clickAddElement() {
        clickMenuItem(0, "Add element");
    }

    public void clickDeleteElement() {
        clickMenuItem(0, "Delete");
    }

    public void clickPropose(String type){
        hoverMenuItem(0,"Propose");
        clickMenuItem(1,type);
    }

    public class FAddProperty {

        public FAddProperty setPropertyName(String foo) {
            Findr input = $("#property-name-editor");
            input.clear();
            input.sendKeys(foo);
            return this;
        }

        private Findr findAddForm() {
            return $$(".diesel-json-editor .add-prop-form")
                    .expectOne();
        }

        public void clickAdd() {
            findAddForm()
                    .$$(".buttons-row button")
                    .where(textEquals("Add"))
                    .expectOne()
                    .click();
        }
    }

}
