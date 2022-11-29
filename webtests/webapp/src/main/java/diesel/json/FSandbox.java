package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.formz.Select;

public class FSandbox extends AbstractPageObject {

    public FSandbox(Findr findr) {
        super(findr);
    }

    public FSandbox selectSample(String sample) {
        new Select($("#sampleSchemaSelect")).selectByVisibleText(sample);
        return this;
    }

    public final FEditor schemaEditor = new FEditor(getFindr(), "editor1");

    public final FEditor jsonEditor = new FEditor(getFindr(), "editor2");

    public final FJsonForm jsonForm = new FJsonForm(getFindr(), "#json-form");
}
