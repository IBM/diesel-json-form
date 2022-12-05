package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.JavascriptExecutor;

import java.util.Arrays;

import static org.junit.Assert.assertEquals;

public class FEditor extends AbstractPageObject {

    private final String id;
    private final JavascriptExecutor js = (JavascriptExecutor) getDriver();
    private final String windowEditorRef;

    public FEditor(Findr f, String id) {
        super(f.$("#" + id));
        this.id = id;
        this.windowEditorRef= "window." + this.id;
    }

    public FEditor assertText(String expectedText) {
        String value = getText();
        assertEquals(expectedText, value);
        return this;
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

    public String getText() {
        return getFindr().eval(e ->
                (String) js.executeScript("return " + windowEditorRef + ".getValue();")
        );
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
