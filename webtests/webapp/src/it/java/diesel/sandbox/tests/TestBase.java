package diesel.sandbox.tests;

import com.pojosontheweb.selenium.Findr;
import com.pojosontheweb.selenium.ManagedDriverJunit4TestBase;
import diesel.json.FSandbox;
import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.LoggingPreferences;

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public abstract class TestBase extends ManagedDriverJunit4TestBase {

    protected static final Logger logger = Logger.getLogger(TestBase.class.getName());

    public FSandbox sandbox;

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
}
