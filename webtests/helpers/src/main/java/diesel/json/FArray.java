package diesel.json;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.Findrs;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

import java.util.function.Function;

import static com.pojosontheweb.selenium.Findrs.textEquals;

public class FArray extends FJsonValue {

    private final Findr fRoot;

    FArray(Findr fRoot, JsPath path, Findr findr) {
        super(path, findr.elem(By.xpath("./div[contains(@class,'jv-array')]")));
        this.fRoot = fRoot;
    }

    private Findr.ListFindr findElems() {
        return getFindr().elemList(
            By.xpath("./div[contains(@class,'array-elem')]")
        );
    }

    public FString getStringCell(int index) {
        String indexAsString = "" + index;
        Findr cell = $$(".value").where(Findrs.attrEquals("data-path", indexAsString)).at(0);
        return new FString(path.append(index), cell);

    }


    public FArray assertLength(int expectedLength) {
        findElems().count(expectedLength).eval();
        return this;
    }

    public FMenu clickItemMenu(int index) {
        findElems()
                .at(index)
                .elem(By.xpath("./div[contains(@class,'array-elem-head')]"))
                .$$(".prop-menu button")
                .expectOne()
                .click();
        return new FMenu(fRoot);
    }

    public FArray assertError(String expectedError) {
        getFindr()
                .elem(By.xpath("./*[contains(@class,'form-errors')]"))
                .where(textEquals(expectedError))
                .eval();
        return this;
    }


}
