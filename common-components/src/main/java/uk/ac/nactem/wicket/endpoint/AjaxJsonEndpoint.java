package uk.ac.nactem.wicket.endpoint;

import uk.ac.nactem.wicket.ajax.attributes.CallbackParameter;

/**
 *
 * @author sam
 */
public abstract class AjaxJsonEndpoint extends AjaxDataEndpoint {
    
    public AjaxJsonEndpoint() {
        super(AjaxDataEndpoint.JSONTYPE);
    }

    public AjaxJsonEndpoint(CallbackParameter... callbackParameters) {
        super(AjaxDataEndpoint.JSONTYPE, callbackParameters);
    }
}
