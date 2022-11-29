package diesel.json;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class JsPath {

    private final List<String> elems;

    private JsPath(List<String> elems) {
        this.elems = elems;
    }

    public static JsPath empty = new JsPath(Collections.emptyList());

    public JsPath append(String elem) {
        ArrayList<String> newElems = new ArrayList<>(this.elems);
        newElems.add(elem);
        return new JsPath(newElems);
    }

    public JsPath append(int index) {
        return append(Integer.toString(index));
    }

    public String format() {
        return format("/");
    }

    public String format(String separator) {
        return String.join(separator, this.elems);
    }

    public boolean isEmpty() {
        return this.elems.isEmpty();
    }

}
