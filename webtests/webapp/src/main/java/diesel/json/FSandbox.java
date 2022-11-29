package diesel.json;

import com.ibm.bdsl.web.editor.test.FIntelliMirror;
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

    public final FIntelliMirror schemaEditor = new FIntelliMirror(getFindr(), ".sub.schema .IntelliMirrorEditor");

    public final FIntelliMirror jsonEditor = new FIntelliMirror(getFindr(), ".sub.value .IntelliMirrorEditor");

    public final FJsonForm jsonForm = new FJsonForm(getFindr(), "#json-form");
}
