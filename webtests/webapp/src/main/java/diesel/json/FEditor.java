package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.click;

public class FEditor extends AbstractPageObject {

    private final String id;

    public FEditor(Findr f, String id) {
        super(f.$("#" + id));
        this.id = id;
    }

    public FEditor assertText(String expectedText) {
        getFindr().where(attrEquals("value", expectedText)).eval();
        return this;
    }

    public FEditor focus() {
        getFindr().click();
        return this;
    }

    public FEditor clearText() {
        focus();
        getFindr().eval(ta -> {
            JavascriptExecutor js = (JavascriptExecutor) getDriver();
            js.executeScript("document.getElementById('" + id + "').value = '';");
            return "".equals(ta.getAttribute("value"));
        });
        getFindr().sendKeys(" ", Keys.BACK_SPACE);
        return this;
    }

    public FEditor typeText(String text) {
        focus();
        getFindr().sendKeys(text);
        return this;
    }

    public String getText() {
        return getFindr().eval(e -> e.getAttribute("value"));
    }

    public FEditor replaceText(String newText) {
        clearText();
        return typeText(newText);
    }
}
