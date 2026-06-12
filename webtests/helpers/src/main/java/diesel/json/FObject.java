package diesel.json;

import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FObject extends FRenderedElement {

    private FSectionBasedElem sections;

    FObject(JsPath path, Findr form) {
        super(path, form);
        this.sections = new FSectionBasedElem($("section-based-elem"));
    }

    public FObject assertEmpty() {
        sections.assertEmpty("Empty object");
        return this;
    }

    public FObject assertError(String expectedError) {
        sections.assertError(expectedError);
        return this;
    }

    private Findr.ListFindr findPropButtons() {
        return $$(".json-prop-buttons  cds-button");
    }

    public FObject assertAddPropButtons(String prop, String... rest) {
        List<String> props = Stream.concat(
                Stream.of(prop),
                Stream.of(rest))
                .map(x -> "+ " + x)
                .toList();

        findPropButtons()
                .eval(elems -> {
                    List<String> actual = elems.stream().map(WebElement::getText).toList();
                    return actual.equals(props);
                });

        return this;
    }

    public FObject clickAddPropButton(String propName) {
        findPropButtons().where(textEquals("+ " + propName)).expectOne().click();
        return this;
    }

    public FObject assertProperties(String... props) {
        List<String> expected = Stream.of(props).collect(Collectors.toList());
        sections.assertSectionTitles(expected);
        return this;
    }

    public FObject assertEmptyProperties(String... props) {
        for (String prop : props) {
            findPropButtons()
                    .where(textEquals("+ " + prop))
                    .expectOne()
                    .eval();
        }
        return this;
    }

    public FMenu clickPropertyMenu(String propName) {
        return this.sections.clickMenu(propName);
    }

    public FObject assertArrayLength(String propName, int expectedCount) {
        this.sections.assertCounter(propName, expectedCount);
        return this;
    }

    public FObject assertRequiredProperty(String name, boolean required) {
        this.sections.findSectionByTitle(name + (required ? " *" : "")).eval();
        return this;
    }
}
