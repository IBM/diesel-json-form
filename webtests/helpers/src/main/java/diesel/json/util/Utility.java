package diesel.json.util;

import org.openqa.selenium.WebElement;

import java.util.function.Function;

public class Utility {

    public static Function<WebElement, String> getValue = new Function<WebElement, String>() {
        public String apply(WebElement input) {
            return input.getAttribute("value");
        }
    };

    public static Function<WebElement, String> getText = new Function<WebElement, String>() {
        public String apply(WebElement input) {
            return input.getText();
        }
    };
}
