package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;

public class FSandbox extends AbstractPageObject {

    public FSandbox(Findr findr) {
        super(findr);
    }

    public FSandbox selectSample(String sample) {
        new FCarbonDropDown($("#sampleSchemaSelect")).selectValue(sample);
        return this;
    }

    public final FEditor schemaEditor = new FEditor(getFindr(), "ta-schema");

    public final FEditor jsonEditor = new FEditor(getFindr(), "ta-json");

    public final FJsonForm jsonForm = new FJsonForm(getFindr(), "#json-form");

    public FSandbox clickApplyToForm() {
        $("#btn-to-form").click();
        return this;
    }

    public FSandbox clickApplyFromSchema() {
        $("#btn-from-schema").click();
        return this;
    }

    public FSandbox clickApplyFromForm() {
        $("#btn-from-form").click();
        return this;
    }

    public FSandbox clickTabJson() {
        $("#tab-json").click();
        return this;
    }

    public FSandbox clickTabSchema() {
        $("#tab-schema").click();
        return this;
    }

}
