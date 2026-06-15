package diesel.sandbox.tests;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.ManagedDriverJunit4TestBase;
import diesel.json.*;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static com.pojosontheweb.selenium.Findrs.textEquals;

public class ArrayTableTest extends TestBase {

    @Test
    public void arrayRenderer() {
        sandbox.selectSample("RendererTable");
        sandbox.clickTabJson()
                .jsonEditor
                .clearText()
                .typeText("{\n" +
                    "  \"firstName\": \"\",\n" +
                    "  \"lastName\": \"\",\n" +
                    "  \"category\": \"SILVER\",\n" +
                    "  \"lastOrders\": [\n" +
                    "    {\n" +
                    "      \"productId\": \"ABC\",\n" +
                    "      \"amount\": 12,\n" +
                    "      \"quantity\": 13\n" +
                    "    },\n" +
                    "    {\n" +
                    "      \"productId\": \"DEF\",\n" +
                    "      \"amount\": 111,\n" +
                    "      \"quantity\": 222\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n");
        sandbox.clickApplyToForm();

        FArrayTable t =sandbox.jsonForm.arrayTableAt(JsPath.empty.append("lastOrders"));
        t.assertRowCount(2);
        FString s = t.stringAt(0, 0);
        s.assertNoError().assertValue("ABC");
        s.setValue("ABCDEFGH").assertHasError("Invalid string length: max 5");

//        t.clickAddElement()
//                .assertRowCount(3);
//        FString s2 = t.stringAt(0, 2);
//        s2.assertNoError().assertValue("");
//        s2.setValue("ABCDEFGH").assertHasError("Invalid string length: max 5");
//
//        t.selectRows(1,2)
//                .clickDelete();
//                .assertRowCount(1);
//        FString s3 = t.stringAt(0, 0);
//        s3.assertValue("ABCDEFGH").assertHasError("Invalid string length: max 5");
    }



}
