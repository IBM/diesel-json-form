package diesel.json;

import java.util.function.Predicate;

import org.openqa.selenium.WebElement;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Findrs;

public class FJsonValue extends AbstractPageObject {

    public final JsPath path;
    public final boolean ignoreErrorTexts;

    FJsonValue(JsPath path, Findr findr, boolean ignoreErrorTexts) {
        super(findr);
        this.path = path;
        this.ignoreErrorTexts = ignoreErrorTexts;
    }

    protected Predicate<WebElement> textEquals(String expected) {
        return ignoreErrorTexts ? e -> true : Findrs.textEquals(expected);
    }

}
