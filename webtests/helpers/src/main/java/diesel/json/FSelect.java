package diesel.json;

import com.pojosontheweb.selenium.Findr;

public class FSelect extends FRenderedElement {

    private final FCarbonComboBox comboBox;

    FSelect(Findr findr) {
        super(findr);
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
