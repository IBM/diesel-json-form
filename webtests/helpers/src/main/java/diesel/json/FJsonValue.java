package diesel.json;

import com.pojosontheweb.selenium.AbstractPageObject;
import com.pojosontheweb.selenium.Findr;
import org.openqa.selenium.By;

public class FJsonValue extends AbstractPageObject {

    public final JsPath path;

    FJsonValue(JsPath path, Findr findr) {
        super(findr);
        this.path = path;
    }
    

}
