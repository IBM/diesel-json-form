package diesel.json;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Findrs;

public class FArray extends FRenderedElement {

    private final Findr fRoot;
    private final FSectionBasedElem sections;

    FArray(Findr fRoot, Findr f) {
        super(f);
        this.fRoot = fRoot;
        this.sections = new FSectionBasedElem($("section-based-elem"));
    }

    public FArray assertLength(int expectedLength) {
        this.sections.assertLength(expectedLength);
        return this;
    }

    public FMenu clickItemMenu(int index) {
        sections.clickMenu(index);
        return new FMenu(fRoot);
    }

    public FArray assertError(String expectedError) {
        sections.assertError(expectedError);
        return this;
    }

}
