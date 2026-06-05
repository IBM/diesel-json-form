package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.By;

import static com.pojosontheweb.selenium.Findrs.*;

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

    public FMenu clickMenu(int sectionIndex) {
        throw new RuntimeException("TODO");
    }

    public FMenu clickMenu(String sectionTitle) {
        var section = findSections()
                .where(e -> {
                    var span = e.findElement(By.cssSelector(".right-pane .label-container span"));
                    if (span == null) {
                        return false;
                    }
                    return span.getText().equals(sectionTitle);
                })
                .expectOne();
        section
                .$$("cds-button")
                .where(attrEquals("title", "Open menu"))
                .expectOne()
                .click();
        return new FMenu(new Findr(getDriver(), getFindr().getTimeout()));
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
