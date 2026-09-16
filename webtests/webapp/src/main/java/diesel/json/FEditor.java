package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Retry;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

import org.openqa.selenium.Keys;

public class FEditor extends AbstractPageObject {

    public FEditor(Findr f, String id) {
        super(f.$("#" + id));
    }

    public FEditor clearText() {
        Retry.retry()
                .add(() -> {
                    // very strange clear to send events
                    getFindr().click();
                    getFindr().clear();
                    getFindr().sendKeys(" ");
                    getFindr().sendKeys(Keys.BACK_SPACE);
                })
                .add(() -> {
                    assertText("");
                })
                .eval();
        return this;
    }

    public FEditor typeText(String text) {
        getFindr().sendKeys(text);
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
