package diesel.json;

import com.pojosontheweb.selenium.Findr;

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
}
