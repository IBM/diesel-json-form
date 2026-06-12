package diesel.sandbox.tests;

import com.pojosontheweb.selenium.Findr;
import static com.pojosontheweb.selenium.Findrs.attrEquals;
import static com.pojosontheweb.selenium.Findrs.textEquals;

import com.pojosontheweb.selenium.ManagedDriverJunit4TestBase;
import diesel.json.*;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public class SandboxTest extends ManagedDriverJunit4TestBase {

    protected static final Logger logger = Logger.getLogger(SandboxTest.class.getName());

    private FSandbox sandbox;

    @Override
    protected WebDriver createWebDriver() {
        return createWebDriver("en");
    }

    protected WebDriver createWebDriver(String lng) {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--ignore-certificate-errors");
        HashMap<String, String> prefs = new HashMap<>();
        prefs.put("intl.accept_languages", lng);
        options.setExperimentalOption("prefs", prefs);
        LoggingPreferences loggingPrefs = new LoggingPreferences();
        loggingPrefs.enable(LogType.BROWSER, Level.ALL);
        options.setCapability("goog:loggingPrefs", loggingPrefs);
        WebDriver d = new ChromeDriver(options);
        d.manage().window().setSize(new Dimension(1920, 1200));
        return d;
    }

    @After
    public void logBrowserConsole() {
        String browserLog = getWebDriver().manage()
                .logs().get(LogType.BROWSER).getAll().stream()
                .map(logEntry -> "  |BROWSER| " + logEntry.toString())
                .collect(Collectors.joining("\n"));
        if (browserLog.isEmpty()) {
            return;
        }
        logger.info("\n" + browserLog);
        if (Findr.isDebugEnabled()) {
            Findr.logDebug(browserLog);
        }
    }

    @Before
    public void loadPage() {
        getWebDriver().get("http://localhost:3000");
        sandbox = new FSandbox(findr());
    }

    @Test
    public void simpleLong() {
        sandbox.schemaEditor.assertText("{}");
        sandbox.clickTabJson();
        sandbox.jsonEditor.assertText("{}");
        sandbox.jsonForm
                .assertMenuClosed()
                .objectAt(JsPath.empty)
                .assertEmpty();

        sandbox.clickTabSchema();
        sandbox.selectSample("Long");
        sandbox.schemaEditor.assertText("{\n" +
                "  \"type\": [\n" +
                "    \"integer\",\n" +
                "    \"null\"\n" +
                "  ],\n" +
                "  \"format\": \"int64\"\n" +
                "}");
        sandbox.jsonForm
                .objectAt(JsPath.empty)
                .assertError("Invalid type: expected integer | null")
                .assertEmpty();

        sandbox.clickTabJson();
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("true")
                .clearText()
                .typeText("123");

        sandbox.clickApplyToForm();

        sandbox.jsonForm
                .numberAt(JsPath.empty)
                .assertValue("123")
                .assertNoError();
    }

    private final String BeanContainingOtherBean = "BeanContainingOtherBean";
    private final String EnumArray = "EnumArray";
    private final String ObjectArray = "ObjectArray";

    @Test
    public void customerAge() {
        String text = "{\n" +
                "  \"customer\": {\n" +
                "    \"firstName\": \"\",\n" +
                "    \"lastName\": \"\",\n" +
                "    \"amount\": 0,\n" +
                "    \"age\": 0\n" +
                "  }\n" +
                "}";
        sandbox.selectSample(BeanContainingOtherBean).clickTabJson();
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText(text)
                .assertText(text);

        sandbox.clickApplyToForm();

        sandbox.jsonForm
                .numberAt(JsPath.empty.append("customer").append("age"))
                .assertValue("0")
                .setValue("18");

        sandbox.clickApplyFromForm();

        sandbox.jsonEditor
                .assertText("{\n" +
                        "  \"customer\": {\n" +
                        "    \"firstName\": \"\",\n" +
                        "    \"lastName\": \"\",\n" +
                        "    \"amount\": 0,\n" +
                        "    \"age\": 18\n" +
                        "  }\n" +
                        "}");
    }

    @Test
    public void addProperty() {

        FJsonForm f = sandbox.jsonForm;

        sandbox.selectSample(BeanContainingOtherBean);
        sandbox.jsonEditor.assertText("{}");

        f
                .objectAt(JsPath.empty)
                .assertEmpty()
                .assertAddPropButtons("customer")
                .clickAddPropButton("customer");

        JsPath customerPath = JsPath.empty.append("customer");
        f.objectAt(customerPath).assertEmpty();
    }

    @Test
    public void addArrayElement() {
        FJsonForm f = sandbox.jsonForm;

        sandbox.selectSample(ObjectArray);

        f
                .clickRootMenu()
                .clickPropose("array");
        f
                .arrayAt(JsPath.empty)
                .assertLength(0);
        f
                .clickRootMenu()
                .clickAddElement();
        f
                .arrayAt(JsPath.empty)
                .assertLength(1);
        f
                .objectAt(JsPath.empty.append(0))
                .assertEmpty();
    }

    private void assertErrorInvalidType(String type) {
        sandbox.schemaEditor
                .focus()
                .clearText()
                .typeText("{ \"type\": \"" + type + "\" }");
        sandbox.clickApplyFromSchema();

        String expectedError = "Invalid type: expected " + type;
        sandbox.jsonForm
                .objectAt(JsPath.empty)
                .assertEmpty()
                .assertError(expectedError);
    }

    @Test
    public void errors() {
        assertErrorInvalidType("string");
        assertErrorInvalidType("boolean");
        assertErrorInvalidType("array");
        assertErrorInvalidType("number");
    }

    @Test
    public void createObjectNoSchema() {
        FJsonForm f = sandbox.jsonForm;

        f.clickRootMenu()
                .clickAddProperty()
                .setPropertyName("foo")
                .clickAdd();

        f.clickRootMenu()
                .clickAddProperty()
                .setPropertyName("bar")
                .clickAdd();

        f.stringAt(JsPath.empty.append("foo"))
                .setValue("yalla");

        f.objectAt(JsPath.empty)
                .clickPropertyMenu("bar")
                .clickChangeType("number");

        f.numberAt(JsPath.empty.append("bar"))
                .setValue("123");

        sandbox.clickTabJson().clickApplyFromForm();

        sandbox.jsonEditor.assertText("{\n" +
                "  \"foo\": \"yalla\",\n" +
                "  \"bar\": 123\n" +
                "}");
    }

    @Test
    public void createArrayNoSchema() {
        FJsonForm f = sandbox.jsonForm;

        f.clickRootMenu()
                .clickAddProperty()
                .setPropertyName("foo")
                .clickAdd();

        FObject fObject = f.objectAt(JsPath.empty);
        fObject
                .clickPropertyMenu("foo")
                .clickChangeType("array");
        fObject
                .assertArrayLength("foo", 0)
                .clickPropertyMenu("foo")
                .clickAddElement();
        fObject
                .assertArrayLength("foo", 1)
                .clickPropertyMenu("foo")
                .clickAddElement();
        fObject
                .assertArrayLength("foo", 2)
                .clickPropertyMenu("foo")
                .clickAddElement();
        fObject
                .assertArrayLength("foo", 3);

        JsPath fooPath = JsPath.empty.append("foo");

        FArray fArray = f.arrayAt(fooPath);

        fArray
                .assertLength(3)
                .clickItemMenu(0)
                .clickChangeType("string");
        fArray
                .clickItemMenu(1)
                .clickChangeType("number");
        fArray
                .clickItemMenu(2)
                .clickChangeType("boolean");

        f.stringAt(fooPath.append(0))
                .setValue("yalla");

        f.numberAt(fooPath.append(1))
                .setValue("123");

        f.booleanAt(fooPath.append(2))
                .assertChecked(true)
                .clickCheckbox()
                .assertChecked(false);

        sandbox.clickTabJson().clickApplyFromForm();

        sandbox.jsonEditor.assertText("{\n" +
                "  \"foo\": [\n" +
                "    \"yalla\",\n" +
                "    123,\n" +
                "    false\n" +
                "  ]\n" +
                "}");
    }

    @Test
    public void addTypeDate() {
        sandbox.selectSample("Date");
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
        String date = simpleDateFormat.format(new Date());
        sandbox.schemaEditor.assertText("{\n" +
                "  \"type\": \"string\",\n" +
                "  \"format\": \"date\"\n" +
                "}");
        sandbox.jsonForm
                .objectAt(JsPath.empty)
                .assertError("Invalid type: expected string")
                .assertEmpty();

        sandbox.clickTabJson();
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\"\"");
        sandbox.clickApplyToForm();

        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .assertHasError("Invalid format: expected date");

        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\"" + date + "\"");

        sandbox.clickApplyToForm();

        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .assertValue(date)
                .assertNoError();
    }

    @Test
    public void typeDateInInputField() {
        sandbox.selectSample("Date");
        sandbox.schemaEditor.assertText("{\n" +
                "  \"type\": \"string\",\n" +
                "  \"format\": \"date\"\n" +
                "}");

        sandbox.clickTabJson();
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\"\"");

        sandbox.clickApplyToForm();

        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .assertValue("")
                .assertHasError("Invalid format: expected date");

        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .setValue("foo")
                .assertHasError("Invalid format: expected date")
                .assertValue("foo");
    }

    @Test
    public void errorsOnInvalidDateTime() {
        sandbox.selectSample("DateTime");
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
        String date = simpleDateFormat.format(new Date());
        sandbox.schemaEditor.assertText("{\n" +
                "  \"type\": \"string\",\n" +
                "  \"format\": \"date-time\"\n" +
                "}");
        sandbox.jsonForm
                .objectAt(JsPath.empty)
                .assertError("Invalid type: expected string")
                .assertEmpty();

        sandbox.clickTabJson();
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\"\"");
        sandbox.clickApplyToForm();

        sandbox.jsonForm
                .timeAt(JsPath.empty)
                .assertHasError("Invalid format: expected date-time");

        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\"" + date + "T10:10:10Z\"");
        sandbox.clickApplyToForm();

        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .assertValue(date)
                .assertNoError();
        sandbox.jsonForm
                .timeAt(JsPath.empty)
                .assertValue("10:10:10")
                .assertNoError();
    }

    @Test
    public void polymorphism() {
        FJsonForm f = sandbox.jsonForm;
        sandbox.selectSample("Polymorphism");
        sandbox.schemaEditor.assertText("{\n" +
                "  \"$schema\": \"https://json-schema.org/draft/2019-09/schema\",\n" +
                "  \"$id\": \"http://schema.animal.Animal\",\n" +
                "  \"type\": \"object\",\n" +
                "  \"allOf\": [\n" +
                "    {\n" +
                "      \"if\": {\n" +
                "        \"properties\": {\n" +
                "          \"what\": {\n" +
                "            \"type\": \"string\",\n" +
                "            \"const\": \"schema.animal.Lion\"\n" +
                "          }\n" +
                "        }\n" +
                "      },\n" +
                "      \"then\": {\n" +
                "        \"$ref\": \"#/definitions/schema.animal.Lion\"\n" +
                "      }\n" +
                "    },\n" +
                "    {\n" +
                "      \"if\": {\n" +
                "        \"properties\": {\n" +
                "          \"what\": {\n" +
                "            \"type\": \"string\",\n" +
                "            \"const\": \"schema.animal.Elephant\"\n" +
                "          }\n" +
                "        }\n" +
                "      },\n" +
                "      \"then\": {\n" +
                "        \"$ref\": \"#/definitions/schema.animal.Elephant\"\n" +
                "      }\n" +
                "    }\n" +
                "  ],\n" +
                "  \"definitions\": {\n" +
                "    \"schema.animal.Animal\": {\n" +
                "      \"properties\": {\n" +
                "        \"name\": {\n" +
                "          \"type\": [\n" +
                "            \"string\",\n" +
                "            \"null\"\n" +
                "          ]\n" +
                "        },\n" +
                "        \"sound\": {\n" +
                "          \"type\": [\n" +
                "            \"string\",\n" +
                "            \"null\"\n" +
                "          ]\n" +
                "        },\n" +
                "        \"type\": {\n" +
                "          \"type\": [\n" +
                "            \"string\",\n" +
                "            \"null\"\n" +
                "          ]\n" +
                "        },\n" +
                "        \"endangered\": {\n" +
                "          \"type\": \"boolean\"\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"schema.animal.Lion\": {\n" +
                "      \"allOf\": [\n" +
                "        {\n" +
                "          \"$ref\": \"#/definitions/schema.animal.Animal\"\n" +
                "        }\n" +
                "      ],\n" +
                "      \"properties\": {\n" +
                "        \"mane\": {\n" +
                "          \"type\": \"boolean\"\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"schema.animal.Elephant\": {\n" +
                "      \"allOf\": [\n" +
                "        {\n" +
                "          \"$ref\": \"#/definitions/schema.animal.Animal\"\n" +
                "        }\n" +
                "      ],\n" +
                "      \"properties\": {\n" +
                "        \"trunkLength\": {\n" +
                "          \"type\": \"number\",\n" +
                "          \"format\": \"double\"\n" +
                "        },\n" +
                "        \"tusk\": {\n" +
                "          \"type\": \"boolean\"\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}");

        f.clickRootMenu().clickPropose("{ what }");

        sandbox.clickTabJson().clickApplyFromForm();
        sandbox.jsonEditor
                .assertText("{\n" +
                        "  \"what\": \"schema.animal.Lion\"\n" +
                        "}");

        FObject fObject = f.objectAt(JsPath.empty);
        fObject.assertEmptyProperties("mane", "name", "sound", "type", "endangered");
        FSelect select = f.selectAt(JsPath.empty.append("what"));
        select.selectValue("schema.animal.Elephant");
        fObject.assertEmptyProperties("trunkLength", "tusk", "name", "sound", "type", "endangered");
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("{\n" +
                        "  \"what\": \"schema.animal.Elephant\",\n" +
                        "  \"endangered\": true,\n" +
                        "  \"name\": \"\",\n" +
                        "  \"sound\": \"\",\n" +
                        "  \"type\": \"\",\n" +
                        "  \"trunkLength\": 0,\n" +
                        "  \"tusk\": true\n" +
                        "}");
        sandbox.clickApplyToForm();
        fObject.assertProperties("what", "endangered", "name", "sound", "type", "trunkLength", "tusk");

        sandbox.jsonEditor.focus().replaceText("{}");
        sandbox.clickApplyToForm();

        f.clickRootMenu().clickPropose("{ what }");
        fObject.clickAddPropButton("endangered");
        fObject.clickAddPropButton("mane");
        fObject.clickAddPropButton("name");
        fObject.clickAddPropButton("sound");
        fObject.clickAddPropButton("type");
        sandbox.clickApplyFromForm();

        sandbox.jsonEditor
                .assertText("{\n" +
                        "  \"what\": \"schema.animal.Lion\",\n" +
                        "  \"endangered\": true,\n" +
                        "  \"mane\": true,\n" +
                        "  \"name\": \"\",\n" +
                        "  \"sound\": \"\",\n" +
                        "  \"type\": \"\"\n" +
                        "}");
    }

    @Test
    public void enumTest() {
        FJsonForm form = sandbox.jsonForm;

        sandbox.selectSample(EnumArray);

        sandbox.clickTabJson();
        sandbox.jsonEditor.assertText("{}");
        sandbox.jsonEditor
                .focus()
                .clearText();

        String enumContent = "[\n" +
                "  \"BAR\",\n" +
                "  \"FOO\"\n" +
                "]";

        sandbox.jsonEditor
                .typeText(enumContent)
                .assertText(enumContent);

        sandbox.clickApplyToForm();

        FArray fArray = form.arrayAt(JsPath.empty);
        fArray.assertLength(2);

        FSelect stringCell1 = form.selectAt(JsPath.empty.append(1));
        stringCell1.assertValue("FOO");
        stringCell1.selectValue("BAR");
        stringCell1.assertValue("BAR");

        sandbox.clickApplyFromForm();

        sandbox.jsonEditor.assertText("[\n" +
                "  \"BAR\",\n" +
                "  \"BAR\"\n" +
                "]");

        String newEnumContent = "[\n" +
                "  \"BAR\",\n" +
                "  \"TEAM\"\n" +
                "]";

        sandbox.jsonEditor
                .focus()
                .replaceText(newEnumContent)
                .assertText(newEnumContent);
        sandbox.clickApplyToForm();

        String expectedError = "Invalid value: should be one of \"FOO\" | \"BAR\"";
        form
                .selectAt(JsPath.empty.append(1))
                .assertHasError(expectedError);
    }

    @Test
    public void recursiveSchema() {
        FJsonForm f = sandbox.jsonForm;
        sandbox.schemaEditor
                .focus()
                .clearText()
                .typeText("{\n" +
                        "  \"type\": \"object\",\n" +
                        "  \"properties\": {\n" +
                        "    \"name\": { \"type\": \"string\" },\n" +
                        "    \"children\": {\n" +
                        "      \"type\": \"array\",\n" +
                        "      \"items\": { \"$ref\": \"#\" }\n" +
                        "    }\n" +
                        "  }\n" +
                        "}");
        sandbox.clickTabJson();
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("{}");
        sandbox.clickApplyToForm();

        FObject fObject = f.objectAt(JsPath.empty);
        fObject.assertEmptyProperties("name", "children");

        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("{\n" +
                        "  \"name\": \"Elizabeth\",\n" +
                        "  \"children\": [\n" +
                        "    {\n" +
                        "      \"name\": \"Charles\",\n" +
                        "      \"children\": [\n" +
                        "        {\n" +
                        "          \"name\": \"William\",\n" +
                        "          \"children\": [\n" +
                        "            {\n" +
                        "              \"name\": \"George\"\n" +
                        "            },\n" +
                        "            {\n" +
                        "              \"name\": \"Charlotte\"\n" +
                        "            }\n" +
                        "          ]\n" +
                        "        },\n" +
                        "        {\n" +
                        "          \"name\": \"Harry\",\n" +
                        "          \"children\": [\n" +
                        "            {\n" +
                        "              \"name\": \"Archie\"\n" +
                        "            },\n" +
                        "            {\n" +
                        "              \"name\": \"Lilibet\"\n" +
                        "            }\n" +
                        "          ]\n" +
                        "        }\n" +
                        "      ]\n" +
                        "    }\n" +
                        "  ]\n" +
                        "}");

        sandbox.clickApplyToForm();
        f.stringAt(JsPath.empty.append("name")).assertValue("Elizabeth");

        JsPath firstLevelPath = JsPath.empty.append("children");
        FArray fArray1 = f.arrayAt(JsPath.empty.append("children"));
        fArray1.assertLength(1);
        f.stringAt(firstLevelPath.append(0).append("name")).assertValue("Charles");

        JsPath secondLevelPath = firstLevelPath.append(0).append("children");
        FArray fArray2 = f.arrayAt(secondLevelPath);
        fArray2.assertLength(2);
        f.stringAt(secondLevelPath.append(0).append("name")).assertValue("William");
        f.stringAt(secondLevelPath.append(1).append("name")).assertValue("Harry");

        FArray fArray3 = f.arrayAt(secondLevelPath.append(0).append("children"));
        fArray3.assertLength(2);
        f.stringAt(secondLevelPath.append(0).append("children").append(0).append("name")).assertValue("George");
        f.stringAt(secondLevelPath.append(0).append("children").append(1).append("name"))
                .assertValue("Charlotte");

        FArray fArray4 = f.arrayAt(secondLevelPath.append(1).append("children"));
        fArray4.assertLength(2);
        f.stringAt(secondLevelPath.append(1).append("children").append(0).append("name")).assertValue("Archie");
        f.stringAt(secondLevelPath.append(1).append("children").append(1).append("name"))
                .assertValue("Lilibet");
    }

    @Test
    public void dateTimeExampleShouldShowDatePicker() {
        sandbox.schemaEditor.assertText("{}");
        sandbox.jsonEditor.assertText("{}");
        sandbox.jsonForm
                .assertMenuClosed()
                .objectAt(JsPath.empty)
                .assertEmpty();

        sandbox.selectSample("DateTimeExample");
        FJsonForm f = sandbox.jsonForm;
        f.clickRootMenu().clickPropose("2022-11-28T09:27:17Z");
        f.dateAt(JsPath.empty)
                .assertNoError()
                .assertValue("2022-11-28");
        f.timeAt(JsPath.empty)
                .assertNoError()
                .assertValue("09:27:17");
    }

    @Test
    public void testNumberEmptyField() {
        sandbox.schemaEditor.replaceText("{\"type\":\"number\"}");
        sandbox.clickTabJson();
        sandbox.jsonEditor.replaceText("123");
        sandbox.clickApplyToForm();

        FNumber num = sandbox.jsonForm.numberAt(JsPath.empty);

        num
                .assertValue("123")
                .assertNoError();

        num.sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE);

        num.assertHasError("Not a valid number");

        num.findInput().sendKeys("1");

        num.assertValue("1").assertNoError();
    }

    @Test
    public void testNumberInvalid() {
        sandbox.schemaEditor.replaceText("{\"type\":\"number\"}");
        doTestInvalidNumber();
    }

    @Test
    public void testNumberInvalidNoSchema() {
        doTestInvalidNumber();
    }

    private void doTestInvalidNumber() {
        sandbox.clickTabJson();
        sandbox.jsonEditor.replaceText("123");
        sandbox.clickApplyToForm();
        FNumber num = sandbox.jsonForm.numberAt(JsPath.empty);
        num.assertValue("123").assertNoError();
        num
                .setValue("abcdef")
                .assertHasError("Not a valid number");
        num
                .setValue("333")
                .assertNoError();
    }

    @Test
    public void testCustomRenderer() {
        sandbox.selectSample("RendererRating");
        sandbox.clickTabJson();
        sandbox.jsonEditor.replaceText("{\n" + //
                "  \"name\": \"\",\n" + //
                "  \"rating\": 0\n" + //
                "}");
        sandbox.clickApplyToForm();

        FRating rating = new FRating(JsPath.empty.append("rating"), sandbox.jsonForm.getFindr());
        rating
                .assertRating(1)
                .clickRating(3)
                .assertRating(3);
        sandbox.clickApplyFromForm();

        sandbox.jsonEditor.assertText("{\n" + //
                "  \"name\": \"\",\n" + //
                "  \"rating\": 2\n" + //
                "}");
    }

    private Findr.ListFindr findRatings() {
        return $$(".rating .rating-item");
    }

    @Test
    public void testRendererAccessSchema1() {
        sandbox.selectSample("Renderer1");
        sandbox.clickTabJson();
        sandbox.jsonEditor.clearText().typeText("\"\"");
        sandbox.clickApplyToForm();

        assertMyConfigProp("Config prop is undefined");

        sandbox.jsonEditor.replaceText("\"yalla\"");
        sandbox.clickApplyToForm();

        assertMyStringValue("yalla");
        clickConcat();
        assertMyStringValue("yallaX");

        sandbox.clickApplyFromForm();

        sandbox.jsonEditor.assertText("\"yallaX\"");
    }

    @Test
    public void testRendererAccessSchema2() {
        sandbox.selectSample("Renderer2");
        sandbox.clickTabJson();
        sandbox.jsonEditor.clearText().typeText("\"\"");
        sandbox.clickApplyToForm();
        assertMyConfigProp("Config prop set to 123");
    }

    private void clickConcat() {
        $("my-string-renderer button")
                .where(textEquals("Concat !"))
                .click();
    }

    private void assertMyConfigProp(String expected) {
        $("my-string-renderer p")
                .where(textEquals(expected))
                .eval();
    }

    private void assertMyStringValue(String expected) {
        $("my-string-renderer .my-value")
                .where(textEquals(expected))
                .eval();
    }

    @Test
    public void testProposeSubProp() {
        sandbox.selectSample(BeanContainingOtherBean);
        sandbox.jsonForm
                .objectAt(JsPath.empty)
                .clickAddPropButton("customer");
        sandbox.jsonForm
                .objectAt(JsPath.empty)
                .clickPropertyMenu("customer")
                .clickPropose("{ firstName, lastName, amount, age }");
        sandbox.clickTabJson().clickApplyFromForm();
        sandbox.jsonEditor.assertText("{\n" + //
                "  \"customer\": {\n" + //
                "    \"firstName\": \"\",\n" + //
                "    \"lastName\": \"\",\n" + //
                "    \"amount\": 0,\n" + //
                "    \"age\": 0\n" + //
                "  }\n" + //
                "}");
    }

    @Test
    public void testCustomRendererMustMatchValueType() {
        sandbox.selectSample("Renderer2");
        sandbox.jsonForm
                .objectAt(JsPath.empty)
                .assertEmpty();
    }

    @Test
    public void testTableRenderer() {
        sandbox.selectSample("RendererTable");
        sandbox.clickTabJson();
        sandbox.jsonEditor.clearText().typeText("{\n" +
                "  \"firstName\": \"\",\n" +
                "  \"lastName\": \"\",\n" +
                "  \"category\": \"SILVER\",\n" +
                "  \"lastOrders\": [\n" +
                "    {\n" +
                "      \"productId\": \"ABCDEF\",\n" +
                "      \"amount\": 123,\n" +
                "      \"quantity\": 12,\n" +
                "      \"tags\": [\n" +
                "        \"food\"\n" +
                "      ]\n" +
                "    },\n" +
                "    {\n" +
                "      \"productId\": \"XYZ\",\n" +
                "      \"amount\": 333,\n" +
                "      \"quantity\": 2323,\n" +
                "      \"free\": true\n" +
                "    }\n" +
                "  ]\n" +
                "}");
        sandbox.clickApplyToForm();
        FString s = sandbox.jsonForm.stringAt(JsPath.empty.append("lastOrders").append(0).append("productId"));
        s.assertHasError("Invalid string length: max 5");
        s.setValue("ABC");
        s.assertNoError();

        sandbox.clickApplyFromForm();
        sandbox.jsonEditor.assertText("{\n" +
                "  \"firstName\": \"\",\n" +
                "  \"lastName\": \"\",\n" +
                "  \"category\": \"SILVER\",\n" +
                "  \"lastOrders\": [\n" +
                "    {\n" +
                "      \"productId\": \"ABC\",\n" +
                "      \"amount\": 123,\n" +
                "      \"quantity\": 12,\n" +
                "      \"tags\": [\n" +
                "        \"food\"\n" +
                "      ]\n" +
                "    },\n" +
                "    {\n" +
                "      \"productId\": \"XYZ\",\n" +
                "      \"amount\": 333,\n" +
                "      \"quantity\": 2323,\n" +
                "      \"free\": true\n" +
                "    }\n" +
                "  ]\n" +
                "}");
    }

    // @Test
    // public void test

}
