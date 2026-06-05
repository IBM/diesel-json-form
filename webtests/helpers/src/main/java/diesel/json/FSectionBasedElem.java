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
        return getFindr()
            .elemList(
                By.xpath(
        "./div[contains(@class,'json-sections')]/collapsible-section"
                )
            );
    }

    public FSectionBasedElem assertLength(int expected) {
        this.findSections().count(expected).eval();
        return this;
    }

    public FMenu clickMenu(int sectionIndex) {
        clickSectionMenu(findSections().at(sectionIndex));
        return new FMenu(new Findr(getDriver(), getFindr().getTimeout()));
    }

    private Findr findSectionByTitle(String sectionTitle) {
        return findSections()
                .where(e -> {
                    var span = e.findElement(By.cssSelector(".right-pane .label-container span"));
                    if (span == null) {
                        return false;
                    }
                    return span.getText().equals(sectionTitle);
                })
                .expectOne();
    }

    private void clickSectionMenu(Findr fSection) {
        fSection.elemList(
                    By.xpath(
                    "./div[contains(@class,'right-pane')]/div[contains(@class,'label-row')]/cds-button"
                    )
                )
                .where(attrEquals("title", "Open menu"))
                .where(isDisplayed())
                .expectOne()
                .click();
    }

    public FMenu clickMenu(String sectionTitle) {
        clickSectionMenu(findSectionByTitle(sectionTitle));
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

    public FSectionBasedElem assertCounter(String propName, int expectedCount) {
        findSectionByTitle(propName)
                .$$(".json-counter-wrapper cds-tag")
                .expectOne()
                .where(textEquals(expectedCount + ""))
                .eval();
        return this;
    }
}
