package diesel.json;

import com.pojosontheweb.selenium.Findr;
import diesel.json.util.Utility;
import org.openqa.selenium.Keys;

import static com.pojosontheweb.selenium.Findrs.*;

public class FString extends FJsonValue {

    FString(JsPath path, Findr findr) {
        super(path, findr);
    }

    private Findr findInput() {
        return $("#input-" + this.path.format("_"));
    }

    public FString assertValue(String expected) {
        findInput().where(attrEquals("value", expected)).eval();
        return this;
    }

    public FString assertNoError() {
        $$(".cds--form-requirement").count(0).eval();
        findInput().where(not(attrEquals("data-invalid", "true"))).eval();
        return this;
    }

    public FString assertError(String expectedError) {
        $$(".cds--form-requirement")
                .where(textContains(expectedError))
                .count(1)
                .at(0)
                .eval();
        return this;
    }

    public FString setValue(String value) {
        // findInput().clear(); does not work everytime
        clear(findInput());
        findInput().sendKeys(value);
        findInput().sendKeys(Keys.RETURN);
        return this;
    }

    private void clear(Findr input) {
        String content = input.eval(Utility.getValue);
        for (int i = 0; i < content.length(); i++) {
            input.sendKeys(Keys.BACK_SPACE);
        }

    }



}
