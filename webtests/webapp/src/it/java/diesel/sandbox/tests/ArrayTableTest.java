package diesel.sandbox.tests;

import diesel.json.*;
import org.junit.Test;

public class ArrayTableTest extends TestBase {

    @Test
    public void arrayRenderer() {
        sandbox.selectSample("RendererTable");
        sandbox.clickTabJson().jsonEditor
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

        FArrayTable t = sandbox.jsonForm.arrayTableAt(JsPath.empty.append("lastOrders"));
        t.assertRowCount(2);
        FString s = t.stringAt(0, 0);
        s.assertNoError().assertValue("ABC");
        s.setValue("ABCDEFGH").assertHasError("Invalid string length: max 5");

        t.clickAddElement()
                .assertRowCount(3);
        FString s2 = t.stringAt(0, 2);
        s2.assertNoError().assertValue("");
        s2.setValue("ABCDEFGH").assertHasError("Invalid string length: max 5");

        t.selectRows(1, 2)
                .clickDelete()
                .assertRowCount(1);
        FString s3 = t.stringAt(0, 0);
        s3.assertValue("ABCDEFGH").assertHasError("Invalid string length: max 5");
    }

}
