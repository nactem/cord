package uk.ac.nactem.wicket.ajax.attributes;

/**
 *
 * @author sam
 */
public class CallbackParameter implements java.io.Serializable {
    /**
     * Add a parameter to the function declaration. This parameter will not be passed to the AJAX
     * callback. For example, the following code:
     * 
     * <pre>
     * {@literal
     * 	getCallbackFunction(context("event"), context("ui"));
     * }
     * </pre>
     * 
     * generates a function with two parameters, like <code>function(event, ui) {...}</code>.
     * 
     * @param name
     * @return The parameter
    */
    public static CallbackParameter context(String name) {
            return new CallbackParameter(name, null, null);
    }

    /**
     * Add a parameter to the function declaration that is also passed to the AJAX callback. For
     * example, the following code:
     * 
     * <pre>
     * {@literal
     * 	getCallbackFunction(explicit("param"));
     * }
     * </pre>
     * 
     * generates a function with one parameter, like <code>function(param) {...}</code> where
     * 'param' is passed literally as extra parameter to the AJAX callback.
     * 
     * @param name
     * @return The parameter
     */
    public static CallbackParameter explicit(String name) {
            return new CallbackParameter(name, name, name);
    }

    /**
     * Add a parameter to the AJAX callback that is resolved inside the function, it will not be
     * added as function parameter. For example, the following code:
     * 
     * <pre>
     * {@literal
     * 	getCallbackFunction(resolved("param", "global.substring(0, 3)"));
     * }
     * </pre>
     * 
     * generates a function without parameters, like <code>function() {...}</code> where the first 3
     * characters of the global variable 'global' are passed as extra parameter to the AJAX callback
     * under the name 'param'.
     * 
     * @param name
     * @param code
     * @return The parameter
     */
    public static CallbackParameter resolved(String name, String code) {
            return new CallbackParameter(null, name, code);
    }

    /**
     * Add a parameter to the function declaration that is also passed to the AJAX callback, but
     * converted. For example, the following code:
     * 
     * <pre>
     * {@literal
     * 	getCallbackFunction(converted("param", "param.substring(0, 3)"));
     * }
     * </pre>
     * 
     * generates a function with one parameter, like <code>function(param) {...}</code> where the
     * first 3 characters of 'param' are passed as extra parameter to the AJAX callback.
     * 
     * @param name
     * @param code
     * @return The parameter
     */
    public static CallbackParameter converted(String name, String code) {
            return new CallbackParameter(name, name, code);
    }

    private final String functionParameterName;
    private final String ajaxParameterName;
    private final String ajaxParameterCode;

    private CallbackParameter(String functionParameterName, String ajaxParameterName,
            String ajaxParameterCode) {
        this.functionParameterName = functionParameterName;
        this.ajaxParameterName = ajaxParameterName;
        this.ajaxParameterCode = ajaxParameterCode;
    }
    
    public org.apache.wicket.ajax.attributes.CallbackParameter apply() {
        if (ajaxParameterName == null && ajaxParameterCode == null) {
            return org.apache.wicket.ajax.attributes.CallbackParameter.context(functionParameterName);
        }
        if (functionParameterName == null) {
            return org.apache.wicket.ajax.attributes.CallbackParameter.resolved(ajaxParameterName, ajaxParameterCode);
        }
        if (ajaxParameterName.equals(ajaxParameterCode)) {
            return org.apache.wicket.ajax.attributes.CallbackParameter.explicit(ajaxParameterName);
        }
        return org.apache.wicket.ajax.attributes.CallbackParameter.converted(functionParameterName, ajaxParameterCode);
    }
    
    /**
     * @return the name of the parameter to add to the function declaration, or null if no parameter
     *         should be added.
     */
    public String getFunctionParameterName() {
        return functionParameterName;
    }
    
   /**
    * @return the name of the parameter to add to the AJAX callback, or null if no parameter should
    *         be added.
    */
    public String getAjaxParameterName() {
        return ajaxParameterName;
    }

   /**
    * @return the javascript code to use to fill the parameter for the AJAX callback.
    */
    public String getAjaxParameterCode() {
        return ajaxParameterCode;
    }
}
