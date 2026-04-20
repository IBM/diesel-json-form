package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.JavascriptExecutor;

import java.util.Arrays;

public class FEditor extends AbstractPageObject {

    private final String id;
    private final JavascriptExecutor js = (JavascriptExecutor) getDriver();
    private final String windowEditorRef;

    public FEditor(Findr f, String id) {
        super(f.$("#" + id));
        this.id = id;
        this.windowEditorRef = "window." + this.id;
    }

    public FEditor clearText() {
        getFindr().eval(e -> {
            js.executeScript(windowEditorRef + ".setValue('');");
            return true;
        });
        return this;
    }

    public FEditor typeText(String text) {
        getFindr().eval(e -> {
            String[] escaped = text.split("\n");
            Arrays.asList(escaped).forEach(line -> {
                String script = windowEditorRef +
                        ".setValue(" +
                        windowEditorRef +
                        ".getValue() + '" +
                        line + "\\n" +
                        "');";
                js.executeScript(script);
            });

            return true;
        });
        return this;
    }

    public FEditor assertText(String expected) {
        getFindr().where(e -> {
            String value = (String) js.executeScript("return " + windowEditorRef + ".getValue();");
            return expected.equals(value.trim());
        }).eval();
        return this;
    }

    public FEditor replaceText(String newText) {
        clearText();
        return typeText(newText);
    }

    public FEditor focus() {
        getFindr().$(".view-lines").click();
        return this;
    }
}
