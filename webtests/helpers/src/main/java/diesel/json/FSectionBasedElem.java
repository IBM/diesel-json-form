package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import static com.pojosontheweb.selenium.Findrs.textEquals;
import static com.pojosontheweb.selenium.Findrs.isDisplayed;

public class FSectionBasedElem extends AbstractPageObject {

    public FSectionBasedElem(Findr f) {
        super(f);
    }

    private Findr.ListFindr findSections() {
        return getFindr().$$(
                "div.json-sections > collapsible-section");
    }

    public FSectionBasedElem assertLength(int expected) {
        this.findSections().count(expected).eval();
        return this;
    }

    public FMenu clickMenuItem(int sectionIndex) {
        throw new RuntimeException("TODO");
    }

    public FSectionBasedElem assertError(String expected) {
        $(".json-errors")
                .where(textEquals(expected))
                .where(isDisplayed())
                .eval();
        return this;
    }

    public FSectionBasedElem assertEmpty(String message) {
        $(".json-section-empty")
                .where(textEquals(message))
                .where(isDisplayed())
                .eval();
        return this;
    }

}
