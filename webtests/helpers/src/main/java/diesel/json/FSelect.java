package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FSelect extends FRenderedElement {

    private final FCarbonComboBox comboBox;

    FSelect(JsPath path, Findr findr) {
        super(path, findr);
        this.comboBox = new FCarbonComboBox(getFindr().$("cds-combo-box"));
    }

    public FSelect selectValue(String value) {
        comboBox.selectValue(value);
        return this;
    }

    public FSelect assertValue(String expected) {
        comboBox.assertValue(expected);
        return this;
    }

    public FSelect assertHasError(String expected) {
        comboBox.assertHasError(expected);
        return this;
    }

}
