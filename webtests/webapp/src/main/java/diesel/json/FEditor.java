package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

public class FEditor extends AbstractPageObject {

    private final String id;

    public FEditor(Findr f, String id) {
        super(f.$("#" + id));
        this.id = id;
    }

    public FEditor clearText() {
        getFindr().clear();
        return this;
    }

    public FEditor typeText(String text) {
        getFindr().sendKeys(text);
        // getFindr().eval(e -> {
        //     String[] escaped = text.split("\n");
        //     Arrays.asList(escaped).forEach(line -> {
        //         String script = windowEditorRef +
        //                 ".setValue(" +
        //                 windowEditorRef +
        //                 ".getValue() + '" +
        //                 line + "\\n" +
        //                 "');";
        //         js.executeScript(script);
        //     });

        //     return true;
        // });
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
