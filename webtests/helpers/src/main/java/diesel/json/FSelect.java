package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.*;

public class FSelect extends FJsonValue {

    FSelect(JsPath path, Findr findr) {
        super(path, findr);
    }

    private Findr findInput() {
        return $("#input-" + this.path.format("_"));
    }

    public FSelect selectValue(String value) {
        findInput().click();
        $("div").where(textEquals(value)).click();
        return this;
    }

    public FSelect assertValue(String expected) {
        findInput().where(attrEquals("value", expected)).eval();
        return this;
    }
}
