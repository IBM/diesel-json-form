package diesel.json;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Findrs;

public class FArray extends FRenderedElement {

    private final Findr fRoot;
    private final FSectionBasedElem sections;

    FArray(Findr fRoot, JsPath path, Findr form) {
        super(path, form);
        this.fRoot = fRoot;
        this.sections = new FSectionBasedElem($("section-based-elem"));
    }

    public FString getStringCell(int index) {
        String indexAsString = "" + index;
        Findr cell = $$(".value").where(Findrs.attrEquals("data-path", indexAsString)).at(0);
        return new FString(path.append(index), cell);
    }

    public FArray assertLength(int expectedLength) {
        this.sections.assertLength(expectedLength);
        return this;
    }

    public FMenu clickItemMenu(int index) {
        sections.clickMenuItem(index);
        return new FMenu(fRoot);
    }

    public FArray assertError(String expectedError) {
        sections.assertError(expectedError);
        return this;
    }

}
