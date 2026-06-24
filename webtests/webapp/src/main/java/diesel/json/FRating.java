package diesel.json;

import com.pojosontheweb.selenium.Findr;

import static com.pojosontheweb.selenium.Findrs.attrEquals;

public class FRating extends FRenderedElement {

    public FRating(Findr f) {
        super(f);
    }

    public FRating assertRating(int expected) {
        getFindr().where(attrEquals("rating", expected + "")).eval();
        ;
        return this;
    }

    public FRating clickRating(int rating) {
        $$("star-element icon-elem")
                .at(rating - 1)
                .click();
        return this;
    }
}
