package diesel.json;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Findrs;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FObject extends FJsonValue {

    private final Findr fRoot;

    FObject(Findr fRoot, JsPath path, Findr findr) {
        super(path, findr.elem(By.xpath("./div[contains(@class,'jv-object')]")));
        this.fRoot = fRoot;
    }

    public FObject assertEmpty() {
        getFindr()
                .elem(By.xpath("./*[contains(@class,'empty-obj')]"))
                .eval();
        return this;
    }

    public FObject assertError(String expectedError) {
        getFindr()
                .elem(By.xpath("./*[contains(@class,'form-errors')]"))
                .where(textEquals(expectedError))
                .eval();
        return this;
    }

    private Findr.ListFindr findPropButtons() {
        return getFindr()
                .elemList(
                        By.xpath("./div/div[contains(@class,'add-prop-row')]/button"));
    }

    public FObject assertAddPropButtons(String prop, String... rest) {
        List<String> props = Stream.concat(
                Stream.of(prop),
                Stream.of(rest)).collect(Collectors.toList());

        findPropButtons()
                .eval(elems -> {
                    List<String> actual = elems.stream().map(WebElement::getText).collect(Collectors.toList());
                    return actual.equals(props);
                });

        return this;
    }

    public FObject clickAddPropButton(String propName) {
        findPropButtons().where(textEquals(propName)).expectOne().click();
        return this;
    }

    public FObject assertProperties(String... props) {
        List<String> expected = Stream.of(props).collect(Collectors.toList());
        getFindr()
                .elemList(
                        By.xpath(
                                "./div[contains(@class,'object-prop')]/div[contains(@class,'prop-name-row')]/div[contains(@class,'prop-name')]"))
                .eval(elems -> {
                    List<String> actual = elems.stream().map(WebElement::getText).collect(Collectors.toList());
                    return actual.equals(expected);
                });
        return this;
    }

    public FObject assertEmptyProperties(String... props) {
        List<String> expected = Stream.of(props).collect(Collectors.toList());
        getFindr()
                .elemList(
                        By.xpath(
                                "./div/div[contains(@class,'add-prop-row')]/button"))
                .eval(elems -> {
                    List<String> actual = elems.stream().map(WebElement::getText).collect(Collectors.toList());
                    return actual.equals(expected);
                });
        return this;
    }

    private Findr findPropRow(String propName) {
        return getFindr().elemList(By.xpath("./div[contains(@class,'object-prop')]"))
                .where(e -> {
                    WebElement propNameElem = e.findElement(
                            By.xpath(
                                    "./div[contains(@class,'prop-name-row')]/div[contains(@class,'prop-name')]"));
                    if (propNameElem == null) {
                        return false;
                    }
                    return propNameElem.getText().equals(propName);
                })
                .expectOne();
    }

    private Findr findPropNameRow(String propName) {
        return findPropRow(propName)
                .elemList(By.xpath("./div[contains(@class,'prop-name-row')]"))
                .expectOne();
    }

    public FMenu clickPropertyMenu(String propName) {
        findPropNameRow(propName)
                .$$(".prop-menu button")
                .expectOne()
                .click();
        return new FMenu(fRoot);
    }

    public FObject assertArrayLength(String propName, int expectedCount) {
        findPropRow(propName)
                .$$(".array-counter span")
                .where(textEquals(Integer.toString(expectedCount)))
                .expectOne()
                .eval();
        return this;
    }

    public FObject selectPropertyValue(String property, String value) {
        Findr findSelect = findPropRow(property)
                .$$(".cds--list-box__menu-icon")
                .expectOne();

        findSelect.click();
        $$(".cds--list-box__menu-item__option")
                .where(Findrs.textEquals(value))
                .expectOne()
                .click();

        return this;
    }
}
