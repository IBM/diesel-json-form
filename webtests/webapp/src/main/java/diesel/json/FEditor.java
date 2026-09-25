package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.JavascriptExecutor;

public class FEditor extends AbstractPageObject {

    private String id;

    public FEditor(Findr f, String id) {
        super(f.$("#" + id));
        this.id = id;
    }

    public FEditor setText(String text) {
        getFindr().eval((e) -> {
            ((JavascriptExecutor) getDriver()).executeScript(id + ".value = arguments[0];", text);
            return true;
        });
        return this;
    }

    public FEditor assertText(String expected) {
        getFindr().eval((e) -> {
            String value = (String) ((JavascriptExecutor) getDriver()).executeScript("return " + id + ".value;");
            return expected.equals(value);
        });
        return this;
    }

    public FEditor focus() {
        getFindr().click();
        return this;
    }
}
