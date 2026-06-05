package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.JavascriptExecutor;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

import java.util.Arrays;

public class FEditor extends AbstractPageObject {

    public FEditor(Findr f, String id) {
        super(f.$("#" + id));
    }

    public FEditor clearText() {
        this.getFindr().clear();
        return this;
    }

    public FEditor typeText(String text) {
        this.getFindr().sendKeys(text);
        return this;
    }

    public FEditor assertText(String expected) {
        getFindr().where(attrEquals("value", expected)).eval();
        return this;
    }

    public FEditor replaceText(String newText) {
        clearText();
        return typeText(newText);
    }

    public FEditor focus() {
        getFindr().click();
        return this;
    }
}
