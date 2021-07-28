package uk.ac.nactem.wicket.endpoint;

import org.apache.wicket.markup.MarkupType;
import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.request.handler.TextRequestHandler;
import org.apache.wicket.request.mapper.parameter.PageParameters;

/**
 *
 * @author sam
 */
public abstract class JsonResponsePage extends WebPage {
    public JsonResponsePage(final PageParameters pp) {
        super(pp);
        //getRequestCycle().scheduleRequestHandlerAfterCurrent(
        //        new TextRequestHandler("application/json", "UTF-8", sendResponse(pp)));                
    }
     
    @Override
    public MarkupType getMarkupType() {
        return new MarkupType("html","application/json");
    }
 
    protected abstract String sendResponse(final PageParameters pp);
}
