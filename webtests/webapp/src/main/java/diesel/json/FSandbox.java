package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import static com.pojosontheweb.selenium.Findrs.isEnabled;

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
        $("#btn-to-form").where(isEnabled()).click();
        return this;
    }

    public FSandbox clickApplyFromSchema() {
        $("#btn-from-schema").where(isEnabled()).click();
        return this;
    }

    public FSandbox clickApplyFromForm() {
        $("#btn-from-form").where(isEnabled()).click();
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

    public FSandbox assertStrictMode(boolean checked) {
        if (checked) {
            $("#cb-strict-mode[checked]").eval();
        } else {
            $("#cb-strict-mode:not([checked])").eval();
        }
        return this;
    }

    public FSandbox clickStrictMode() {
        $("#cb-strict-mode").click();
        return this;
    }
}
