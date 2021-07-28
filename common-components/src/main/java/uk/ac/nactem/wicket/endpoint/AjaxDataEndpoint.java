package uk.ac.nactem.wicket.endpoint;

import org.apache.wicket.ajax.AjaxChannel;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.attributes.AjaxRequestAttributes;
import org.apache.wicket.ajax.attributes.AjaxCallListener;
import org.apache.wicket.request.cycle.RequestCycle;
import org.apache.wicket.request.handler.TextRequestHandler;
import org.apache.wicket.request.mapper.parameter.PageParameters;
import uk.ac.nactem.wicket.ajax.AbstractAjaxCallback;
import uk.ac.nactem.wicket.ajax.attributes.CallbackParameter;

/**
 *
 * @author sam
 */
public abstract class AjaxDataEndpoint extends AbstractAjaxCallback {
    public static final String TEXTTYPE = "text/plain";
    public static final String JSONTYPE = "application/json";
    
    private String contentType = TEXTTYPE;
    private String encoding = null;
    
    public AjaxDataEndpoint (String contentType, String encoding,
            CallbackParameter... callbackParameters) {
        super(callbackParameters);
        this.contentType = contentType;
        this.encoding = encoding;
    }
    
    public AjaxDataEndpoint (String contentType, String encoding) {
        this(contentType, encoding, (CallbackParameter[]) null);
    }
    
    public AjaxDataEndpoint (String contentType,
            CallbackParameter... callbackParameters) {
        this(contentType, null, callbackParameters);
    }
    
    public AjaxDataEndpoint (String contentType) {
        this(contentType, null, (CallbackParameter[]) null);
    }
    
    protected abstract String sendResponse(PageParameters pp);

    @Override
    protected void updateAjaxAttributes(AjaxRequestAttributes attributes) {
        // "ch":"1","wr":false,"dt":"json","sh"
        attributes.setChannel(new AjaxChannel("dat",AjaxChannel.Type.DROP));
        attributes.setDataType("json");
        attributes.setWicketAjaxResponse(false);
        AjaxCallListener success = new AjaxCallListener().onSuccess("if (ondata) {ondata(data);}");
        attributes.getAjaxCallListeners().add(success);
    }

    @Override
    public CharSequence getCallbackFunction(CallbackParameter... extraParameters) {
        CallbackParameter[] parameters;
        if (extraParameters == null || extraParameters.length == 0) {
            parameters = new CallbackParameter[1];
        }
        else {
            parameters = new CallbackParameter[extraParameters.length+1];
            for (int i = 0; i < extraParameters.length; ++i) {
                parameters[i+1] = extraParameters[i];
            }
        }
        parameters[0] = CallbackParameter.context("ondata");
        return super.getCallbackFunction(parameters);
    }
    
    @Override
    protected void respond(AjaxRequestTarget target) {
        RequestCycle.get().scheduleRequestHandlerAfterCurrent(
            new TextRequestHandler(contentType, encoding,
                    sendResponse(target.getPageParameters())));
    }    
}
