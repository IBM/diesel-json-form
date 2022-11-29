package diesel.sandbox.tests;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.ManagedDriverJunit4TestBase;
import diesel.json.*;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;

import static org.hamcrest.text.IsEqualCompressingWhiteSpace.equalToCompressingWhiteSpace;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
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
        options.setCapability(CapabilityType.LOGGING_PREFS, loggingPrefs);
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
        sandbox.jsonEditor.assertText("{}");
        sandbox.jsonForm
                .assertMenuClosed()
                .objectAt(JsPath.empty)
                .assertEmpty();

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

        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("true")
                .assertHasErrors()
                .clearText()
                .typeText("123")
                .assertHasNoErrors();

        sandbox.jsonForm
                .numberAt(JsPath.empty)
                .assertValue(123)
                .assertNoError();
    }

    private final String BeanContainingOtherBean = "BeanContainingOtherBean";
    private final String EnumArray = "EnumArray";

    @Test
    public void customerAge() {
        sandbox.selectSample(BeanContainingOtherBean);
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("{\n" +
                        "  \"customer\": {\n" +
                        "    \"firstName\": \"\",\n" +
                        "    \"lastName\": \"\",\n" +
                        "    \"amount\": 0,\n" +
                        "    \"age\": 0\n" +
                        "  }\n" +
                        "}")
                .assertHasNoErrors();
        sandbox.jsonForm
                .numberAt(JsPath.empty.append("customer").append("age"))
                .assertValue(0)
                .setValue(18);
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
        f.objectAt(customerPath)
                .assertProperties("age", "amount", "firstName", "lastName");

        f.stringAt(customerPath.append("firstName"))
                .assertValue("")
                .setValue("John");
        f.stringAt(customerPath.append("lastName"))
                .assertValue("")
                .setValue("Doe");
        f.numberAt(customerPath.append("amount"))
                .assertValue(0)
                .setValue(123);
        f.numberAt(customerPath.append("age"))
                .assertValue(0)
                .setValue(18);

        sandbox.jsonEditor
                .assertText("{\n" +
                        "  \"customer\": {\n" +
                        "    \"age\": 18,\n" +
                        "    \"amount\": 123,\n" +
                        "    \"firstName\": \"John\",\n" +
                        "    \"lastName\": \"Doe\"\n" +
                        "  }\n" +
                        "}");
    }

    private void assertErrorInvalidType(String type) {
        sandbox.schemaEditor
                .focus()
                .clearText()
                .typeText("{ \"type\": \"" + type + "\" }");
        String expectedError = "Invalid type: expected " + type;
        sandbox.jsonEditor
                .assertHasErrors()
                .moveMouseToGutter(0)
                .tooltip()
                .assertContains(expectedError);
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


        f.objectAt(JsPath.empty)
                .clickPropertyMenu("foo")
                .clickChangeType("string");

        f.stringAt(JsPath.empty.append("foo"))
                .setValue("yalla");

        f.objectAt(JsPath.empty)
                .clickPropertyMenu("bar")
                .clickChangeType("number");

        f.numberAt(JsPath.empty.append("bar"))
                .setValue(123);

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
                .setValue(123);

        f.booleanAt(fooPath.append(2))
                .assertChecked(true)
                .clickCheckbox()
                .assertChecked(false);

        sandbox.jsonEditor.assertText("{\n" +
                "  \"foo\": [\n" +
                "    \"yalla\",\n" +
                "    123,\n" +
                "    false\n" +
                "  ]\n" +
                "}");
    }
    @Test
    public void AddTypeDate(){
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

        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\"\"")
                .assertHasErrors();
        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .assertHasError("Invalid format: expected date");

        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\""+date+"\"")
                .assertHasNoErrors();

        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .assertValue(date)
                .assertNoError();
    }

    @Test
    public void ErrorsOnInvalidDateTime(){
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

        // use intellimirror
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\"\"")
                .assertHasErrors();

        // assert the form has errors when it string is empty
        sandbox.jsonForm
                .dateAt(JsPath.empty)
                .assertHasError("Invalid format: expected date-time");
        sandbox.jsonForm
                .timeAt(JsPath.empty)
                .assertHasError("Invalid format: expected date-time");

        // use the intellimirror to input a value without errors
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("\""+date+"T10:10:10Z\"")
                .assertHasNoErrors();

        // assert the form has no error
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
    public void polymorphism(){
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
        sandbox.jsonEditor
                .assertText("{\n" +
                        "  \"what\": \"schema.animal.Lion\"\n" +
                        "}");
        FObject fObject = f.objectAt(JsPath.empty);
        fObject.assertEmptyProperties("endangered","mane","name","sound","type");
        fObject.selectPropertyValue("what","schema.animal.Elephant");
        fObject.assertEmptyProperties("endangered","name","sound","trunkLength","tusk","type");
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
        fObject.assertProperties("what","endangered","name","sound","type","trunkLength","tusk");
        sandbox.jsonEditor.focus().clearText();
        f.clickRootMenu().clickPropose("{ what }");
        fObject.clickAddPropButton("endangered");
        fObject.clickAddPropButton("mane");
        fObject.clickAddPropButton("name");
        fObject.clickAddPropButton("sound");
        fObject.clickAddPropButton("type");
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

        sandbox.jsonEditor.assertText("{}");

        sandbox.jsonEditor
                .focus()
                .clearText();

        String enumContent = "[\n" +
                "  \"BAR\",\n" +
                "  \"FOO\"\n" +
                "]";

        sandbox.jsonEditor
                .typeText(enumContent);


        String content = sandbox.jsonEditor.getText();

        Assert.assertTrue("ERROR : differences between content \""+content+"\" and input \""+enumContent+"\"",
                equalToCompressingWhiteSpace(enumContent.trim()).matches(content.trim()));

        FArray fArray = form.arrayAt(JsPath.empty);
        fArray.assertLength(2);

        FString stringCell1 = fArray.getStringCell(1);
        stringCell1.assertValue("FOO");
        stringCell1.setValue("BAR");
        stringCell1.assertValue("BAR");
        // No error possible, we can only set a valid value here : looks strange I can set an unsupported value but no error
        // even jsonEditor is not updated
        content = sandbox.jsonEditor.getText();
        String newEnumContent = "[\n" +
                "  \"BAR\",\n" +
                "  \"BAR\"\n" +
                "]";
        Assert.assertTrue("ERROR : differences between content \""+content+"\" and input \""+newEnumContent+"\"",
                equalToCompressingWhiteSpace(newEnumContent.trim()).matches(content.trim()));

        newEnumContent = "[\n" +
                "  \"BAR\",\n" +
                "  \"TEAM\"\n" +
                "]";

        sandbox.jsonEditor
                .focus()
                .replaceText(newEnumContent);


        String expectedError = "Invalid value: should be one of \"FOO\" | \"BAR\"";
        fArray
                .getStringCell(1)
                .assertError(expectedError);


    }

    @Test
    public void recursiveSchema(){
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
        FObject fObject = f.objectAt(JsPath.empty);
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("{}");
        fObject.assertEmptyProperties("children","name");
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

        f.stringAt(JsPath.empty.append("name")).assertValue("Elizabeth");

        JsPath firstLevelPath=JsPath.empty.append("children");
        FArray fArray1 = f.arrayAt(JsPath.empty.append("children"));
        fArray1.assertLength(1);
        f.stringAt(firstLevelPath.append(0).append("name")).assertValue("Charles");

        JsPath secondLevelPath=firstLevelPath.append(0).append("children");
        FArray fArray2= f.arrayAt(secondLevelPath);
        fArray2.assertLength(2);
        f.stringAt(secondLevelPath.append(0).append("name")).assertValue("William");
        f.stringAt(secondLevelPath.append(1).append("name")).assertValue("Harry");

        FArray fArray3=f.arrayAt(secondLevelPath.append(0).append("children"));
        fArray3.assertLength(2);
        f.stringAt(secondLevelPath.append(0).append("children").append(0).append("name")).assertValue("George");
        f.stringAt(secondLevelPath.append(0).append("children").append(1).append("name")).assertValue("Charlotte");

        FArray fArray4=f.arrayAt(secondLevelPath.append(1).append("children"));
        fArray4.assertLength(2);
        f.stringAt(secondLevelPath.append(1).append("children").append(0).append("name")).assertValue("Archie");
        f.stringAt(secondLevelPath.append(1).append("children").append(1).append("name")).assertValue("Lilibet");

    }
    @Test
    public void testInheritance(){
        FJsonForm f = sandbox.jsonForm;
        sandbox.schemaEditor
                .focus()
                .clearText()
                .typeText("{\n" +
                        "  \"$schema\": \"https://json-schema.org/draft/2019-09/schema\",\n" +
                        "  \"$id\": \"http://schema.student.Student\",\n" +
                        "  \"type\": \"object\",\n" +
                        "  \"allOf\": [\n" +
                        "    {\n" +
                        "      \"$ref\": \"#/definitions/schema.person.Person\"\n" +
                        "    }\n" +
                        "  ],\n" +
                        "  \"properties\": {\n" +
                        "    \"graduation-year\": {\n" +
                        "      \"type\": \"string\",\n" +
                        "      \"description\": \"Year in which the student is expected to graduate.\"\n" +
                        "    }\n" +
                        "  },\n" +
                        "  \"definitions\": {\n" +
                        "    \"schema.person.Person\": {\n" +
                        "      \"type\": \"object\",\n" +
                        "      \"description\": \"Properties shared by all people.\",\n" +
                        "      \"properties\": {\n" +
                        "        \"date-of-birth\": {\n" +
                        "          \"type\": \"string\",\n" +
                        "          \"description\": \"Date of birth  of the person.\"\n" +
                        "        },\n" +
                        "        \"name\": {\n" +
                        "          \"type\": \"string\",\n" +
                        "          \"description\": \"The person's name.\"\n" +
                        "        }\n" +
                        "      }\n" +
                        "    }\n" +
                        "  }\n" +
                        "}\n");
        sandbox.jsonEditor
                .focus()
                .clearText()
                .typeText("{}");
        FObject fObject = f.objectAt(JsPath.empty);
        fObject.assertEmptyProperties("date-of-birth","graduation-year","name");
        sandbox.jsonEditor
                .clearText()
                .typeText("{")
                .predict()
                .assertPredictionsOpen(true)
                .predictions()
                .assertContainsItems("}","\"graduation-year\"","\"date-of-birth\"","\"name\"","\"\"")
                .selectProposal(1,"\"graduation-year\"");
        sandbox.jsonEditor
                .predict()
                .predictions()
                .selectProposal(0, ":");
        sandbox.jsonEditor
                .predict()
                .predictions()
                .selectProposal(0, "\"\"");
        sandbox.jsonEditor
                .predict()
                .predictions()
                .selectProposal(1, "}");
        fObject.assertProperties("graduation-year");
        fObject.assertEmptyProperties("date-of-birth","name");
        f.stringAt(JsPath.empty.append("graduation-year")).assertValue("");
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


}
