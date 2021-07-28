package uk.ac.nactem.wicket.ajax;

import java.util.List;
import org.apache.wicket.WicketRuntimeException;
import org.apache.wicket.ajax.AbstractDefaultAjaxBehavior;
import org.apache.wicket.request.Request;
import org.apache.wicket.request.cycle.RequestCycle;
import org.apache.wicket.util.string.StringValue;
import uk.ac.nactem.wicket.ajax.attributes.CallbackParameter;

/**
 *
 * @author sam
 */
public abstract class AbstractAjaxCallback extends AbstractDefaultAjaxBehavior {
    private final CallbackParameter[] params;
        
    public AbstractAjaxCallback() {
        this((CallbackParameter[]) null);
    }

    public AbstractAjaxCallback(CallbackParameter... params) {
        this.params = params;
    }

    public CharSequence getCallbackFunction(CallbackParameter... extraParameters) {
        org.apache.wicket.ajax.attributes.CallbackParameter[] parameters = null;
        if (extraParameters == null || extraParameters.length == 0) {
            if (params != null) {
                parameters = new org.apache.wicket.ajax.attributes.CallbackParameter[params.length];
                for (int i = 0; i < params.length; ++i) {
                    parameters[i] = params[i].apply();
                }
            }
        }
        else if (params != null) {
            parameters = new org.apache.wicket.ajax.attributes.CallbackParameter[extraParameters.length+params.length];
            for (int i = 0; i < params.length; ++i) {
                parameters[i] = params[i].apply();
            }
            for (int i = 0; i < extraParameters.length; ++i) {
                parameters[i+params.length] = extraParameters[i].apply();
            }
        }
        else {
            parameters = new org.apache.wicket.ajax.attributes.CallbackParameter[extraParameters.length];
            for (int i = 0; i < extraParameters.length; ++i) {
                parameters[i] = extraParameters[i].apply();
            }
        }
        return super.getCallbackFunction(parameters);
    }

    public boolean hasParam(String name) {
        return getRequest().getRequestParameters().getParameterNames().contains(name);
    }

    public StringValue getParam(String name) {
        return getRequest().getRequestParameters().getParameterValue(name);
    }

    public List<StringValue> getParams(String name) {
        return getRequest().getRequestParameters().getParameterValues(name);
    }
    
    protected Request getRequest () {
        RequestCycle requestCycle = RequestCycle.get();
        if (requestCycle == null) {
            throw new WicketRuntimeException("No RequestCycle is currently set!");
        }
        return requestCycle.getRequest();
    }
}
